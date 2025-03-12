import { AlgOption } from './../utils/address/base'
import { encode } from 'base64-arraybuffer'
import { sha256 } from 'js-sha256'
import base32Encode from 'base32-encode'

import TransactionService from '../api/transactions'
import { DIOAddress, Alg } from '../utils'
import PowDifficulty from '../utils/powDifficulty'
import OverviewService from '../api/overview'
import { OriginalTxn } from '../api/type'
import { dataview } from '@dioxide-js/misc'

export interface TransferDIOParams {
  to: string
  amount: string
  secretKey: Uint8Array
  ttl?: number
}

export interface TransferFCAParams {
  symbol: string
  to: string
  amount: string
  secretKey: Uint8Array
  ttl?: number
}

class Transaction {
  private txnServices: TransactionService
  private overViewServices: OverviewService

  alg: Alg = 'sm2'

  constructor(alg: Alg = 'sm2') {
    this.txnServices = new TransactionService()
    this.overViewServices = new OverviewService()
    this.alg = alg
  }

  async getTxn(hash: string) {
    return this.txnServices.getTransactionByHash(hash)
  }

  private async compose(originalTxn: OriginalTxn) {
    const ret = await this.txnServices.compose(originalTxn)
    return ret.TxData
  }

  async sign(originalTxn: OriginalTxn, secretKey: Uint8Array, option?: AlgOption) {
    const dioAddress = new DIOAddress(this.alg, secretKey)
    const txdata = await this.compose(originalTxn)

    let pk: Uint8Array | null = null
    let longPK: Uint8Array | null = null

    if (dioAddress.alg === 'sm2') {
      pk = await dioAddress.getPubicKeyFromPrivateKey(secretKey)
      longPK = dataview.concat(new Uint8Array([4]), pk)
    } else {
      longPK = pk = dioAddress.addressToPublicKey(originalTxn.sender)
    }
    if (!pk) {
      throw new Error('pk error')
    }
    const dataWithPK = dioAddress.insertPKIntoTxData(txdata, [
      { encryptedMethodOrderNumber: dioAddress.methodNum, publicKey: pk },
    ])
    const raw = encode(dataWithPK)
    const signedInfo = await dioAddress.sign(dataWithPK, secretKey, option)
    const signature = dataview.u8ToHex(signedInfo)

    const isValid = await dioAddress.verifySignature(dataWithPK, signature, longPK!, option)
    if (!isValid) {
      throw new Error('sign error')
    }
    const finalInfo = dataview.concat(dataWithPK, signedInfo)
    const powDiff = new PowDifficulty({
      originTxn: finalInfo.buffer,
      ttl: originalTxn.ttl,
    })
    const finalInfowithNonce = powDiff.getHashMixinNonnce()
    const hash = base32Encode(sha256.arrayBuffer(finalInfowithNonce), 'Crockford')
    return {
      composedTxDataWithPK: raw,
      signature: encode(signedInfo),
      longPK: encode(longPK!),
      rawTxData: encode(finalInfowithNonce),
      hash: hash.toLowerCase(),
      pk: encode(pk),
    }
  }

  async send(originTxn: OriginalTxn, secretKey: Uint8Array) {
    const { rawTxData, hash } = await this.sign(originTxn, secretKey)
    const ret = await this.txnServices.sendTransaction({
      txdata: rawTxData,
    })
    return ret.Hash
  }

  async sendRawTx(rawTxData: string) {
    const ret = await this.txnServices.sendTransaction({
      txdata: rawTxData,
    })
    return ret.Hash
  }

  async getEstimatedFee(originTxn: OriginalTxn) {
    const { function: func, args, delegatee, scale = 3, tokens } = originTxn
    const overview = await this.overViewServices.chainStatus()
    const avgGasPrice = overview?.AvgGasPrice || 0
    const to = args.to || args.To

    const ret = await this.txnServices.compose({
      sender: to,
      gasprice: avgGasPrice,
      delegatee: delegatee,
      function: func,
      args,
      tokens,
    })

    const gasLimit = ret.GasOffered.toString()
    const gasFee = this.calculateGasFee({
      average: avgGasPrice,
      scale: scale,
      gasLimit: Number(gasLimit),
    })
    return gasFee
  }

  calculateGasFee(options: { average: number; scale: number; gasLimit: number }): number | string | bigint {
    const { average, scale = 3, gasLimit } = options
    const gasPrice = parseInt(((scale - 1) * 0.25 + 0.5) * average + '', 10)
    const gasFee = gasPrice * gasLimit
    return gasFee
  }

  // getDepositTxByBlock(params: ExcutedTxCond) {
  //   return this.txnServices.getDepositTx(params)
  // }

  // async reclaimWallet({
  //   refund,
  //   residual = false,
  //   residualToken = 'XXX',
  //   secretKeyArray,
  // }: {
  //   refund: boolean
  //   residual?: boolean
  //   residualToken?: string
  //   secretKeyArray: Uint8Array
  // }) {
  //   const pk = await ed.getPublicKey(secretKeyArray)
  //   const { address } = pk2Address(pk)
  //   const sender = fullAddress(
  //     base32Encode(address, 'Crockford').toLocaleLowerCase(),
  //   )
  //   return this.send(
  //     {
  //       sender,
  //       gasprice: 100,
  //       function: 'core.wallet.reclaim',
  //       args: {
  //         Refund: refund,
  //         Residual: residual,
  //         Token: residualToken,
  //       },
  //     },
  //     secretKeyArray,
  //   )
  // }

  async transfer(params: TransferDIOParams) {
    const { to, amount, secretKey, ttl } = params
    const sender = await this.sk2base32Address(secretKey, this.alg)
    return this.send(
      {
        sender,
        gasprice: 100,
        function: 'core.coin.transfer',
        args: {
          To: to,
          Amount: amount,
        },
        ttl,
      },
      secretKey,
    )
  }

  async transferFCA(params: TransferFCAParams) {
    const { symbol, to, amount, secretKey, ttl } = params
    const sender = await this.sk2base32Address(secretKey, this.alg)
    return this.send(
      {
        sender,
        gasprice: 100,
        function: 'core.wallet.transfer',
        args: {
          To: to,
          Amount: amount,
          TokenId: symbol,
        },
        ttl,
      },
      secretKey,
    )
  }

  private async sk2base32Address(sk: Uint8Array, alg: Alg) {
    // const pk = await ed.getPublicKey(sk)
    // const { address } = pk2Address(pk)
    // return fullAddress(base32Encode(address, 'Crockford').toLocaleLowerCase())
    const dioAddress = new DIOAddress(alg, sk)
    const { address } = await dioAddress.generate()
    return address.toLowerCase()
  }
}

export { Transaction }
