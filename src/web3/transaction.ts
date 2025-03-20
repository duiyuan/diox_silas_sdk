import { AlgOption } from './../utils/address/base'
import { encode } from 'base64-arraybuffer'
import { sha256 } from 'js-sha256'
import base32Encode from 'base32-encode'
import { dataview } from '@dioxide-js/misc'

import TransactionService from '../api/transactions'
import { DIOAddress, Alg, toUint8Array } from '../utils'
import PowDifficulty from '../utils/powDifficulty'
import OverviewService from '../api/overview'
import { OriginalTxn } from '../api/type'

export interface TransferDIOParams {
  to: string
  amount: string
  secretKey: Uint8Array | string
  ttl?: number
}

export interface TransferFCAParams {
  symbol: string
  to: string
  amount: string
  secretKey: Uint8Array | string
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

  getTx = async (hash: string) => {
    return this.txnServices.getTransactionByHash(hash)
  }

  private async compose(originalTxn: OriginalTxn) {
    const ret = await this.txnServices.compose(originalTxn)
    return ret.TxData
  }

  async sign(originalTxn: OriginalTxn, secretKey: Uint8Array | string, option?: AlgOption) {
    // const t0 = Date.now()
    if (typeof secretKey === 'string') {
      secretKey = toUint8Array(secretKey)
    }
    const dioAddress = new DIOAddress(this.alg, secretKey)
    const txdata = await this.compose(originalTxn)
    // console.log('compose tx data =>', Date.now() - t0)
    // const t1 = Date.now()
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
    // console.log('sign tx =>', Date.now() - t1)
    const signature = dataview.u8ToHex(signedInfo)

    // const t2 = Date.now()
    const isValid = await dioAddress.verifySignature(dataWithPK, signature, longPK!, option)
    // console.log('verify signature=>', Date.now() - t2)
    // const t3 = Date.now()
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
    // console.log('computed nonce =>', Date.now() - t3)
    // console.log('all =>', Date.now() - t0)
    return {
      composedTxDataWithPK: raw,
      signature: encode(signedInfo),
      longPK: encode(longPK!),
      rawTxData: encode(finalInfowithNonce),
      hash: hash.toLowerCase(),
      pk: encode(pk),
    }
  }

  async send(originTxn: OriginalTxn, secretKey: Uint8Array | string) {
    const { rawTxData } = await this.sign(originTxn, secretKey)
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

  private async sk2base32Address(sk: Uint8Array | string, alg: Alg) {
    if (typeof sk === 'string') {
      sk = toUint8Array(sk)
    }
    const dioAddress = new DIOAddress(alg, sk)
    const { address } = await dioAddress.generate()
    return address.toLowerCase()
  }
}

export { Transaction }
