import { decode, encode } from 'base64-arraybuffer'
import { sha256 } from 'js-sha256'
import base32Encode from 'base32-encode'

import TransactionService from '../api/transactions'
import { concat, DIOAddress } from '../utils'
import PowDifficulty from '../utils/powDifficulty'
import OverviewService from '../api/overview'
import { OriginalTxn } from '../api/type'
import { dataview } from '@dioxide-js/misc'

const TEST_ALG = 'ed25519'

class Transaction {
  private txnServices: TransactionService
  private overViewServices: OverviewService

  constructor() {
    this.txnServices = new TransactionService()
    this.overViewServices = new OverviewService()
  }

  async getTxn(hash: string) {
    return this.txnServices.getTransactionByHash(hash)
  }

  private async compose(originalTxn: OriginalTxn) {
    const ret = await this.txnServices.compose(originalTxn)
    return ret.TxData
  }

  async sign(originalTxn: OriginalTxn, secretKey: Uint8Array) {
    const dioAddress = new DIOAddress(TEST_ALG, secretKey)
    const txdata = await this.compose(originalTxn)

    let pk: Uint8Array | null = null

    if (dioAddress.alg === 'sm2') {
      pk = await dioAddress.getPubicKeyFromPrivateKey(secretKey)
      pk = dataview.concat(new Uint8Array([4]), pk)
    } else {
      pk = dioAddress.addressToPublicKey(originalTxn.sender)
    }
    if (!pk) {
      throw new Error('pk error')
    }
    const dataWithPK = dioAddress.insertPKIntoTxData(txdata, [
      { encryptedMethodOrderNumber: dioAddress.methodNum, publicKey: pk },
    ])
    const signedInfo = await dioAddress.sign(dataWithPK, secretKey)
    const signature = dataview.u8ToHex(signedInfo)
    const isValid = await dioAddress.verifySignature(dataWithPK, signature, pk)
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
      rawTxData: encode(finalInfowithNonce),
      hash: hash.toLowerCase(),
    }
  }

  async send(originTxn: OriginalTxn, secretKey: Uint8Array) {
    const { rawTxData: signData, hash } = await this.sign(originTxn, secretKey)
    console.log('computed hash =>', hash)
    const ret = await this.txnServices.sendTransaction({
      txdata: signData,
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

  async transfer({ to, amount, secretKey, ttl }: { to: string; amount: string; secretKey: Uint8Array; ttl?: number }) {
    const sender = await this.sk2base32Address(secretKey, TEST_ALG)
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

  async transferFCA({
    symbol,
    to,
    amount,
    secretKey,
    ttl,
  }: {
    symbol: string
    to: string
    amount: string
    secretKey: Uint8Array
    ttl?: number
  }) {
    const sender = await this.sk2base32Address(secretKey, TEST_ALG)
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

  private async sk2base32Address(sk: Uint8Array, alg: 'sm2' | 'ed25519') {
    // const pk = await ed.getPublicKey(sk)
    // const { address } = pk2Address(pk)
    // return fullAddress(base32Encode(address, 'Crockford').toLocaleLowerCase())
    const dioAddress = new DIOAddress(alg, sk)
    const { address } = await dioAddress.generate()
    return address.toLowerCase()
  }
}

export { Transaction }
