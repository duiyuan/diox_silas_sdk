import { AlgOption } from './../utils/address/base'
import { encode } from 'base64-arraybuffer'
import { sha256 } from 'js-sha256'
import base32Encode from 'base32-encode'
import { dataview } from '@dioxide-js/misc'

import TransactionService from '../api/transactions'
import { DIOAddress, Alg, toUint8Array, isValidAddress } from '../utils'
import PowDifficulty from '../utils/powDifficulty'
import OverviewService from '../api/overview'
import { OriginalTxn } from '../api/type'

export interface TransferDIOParams {
  to: string
  amount: string
  secretKey: Uint8Array | string
  ttl?: number
  sender: string
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
  showTxFlow?: boolean
  n = 1

  private duration = {
    compose: 0,
    sign: 0,
    verify: 0,
    computedNonce: 0,
    all: 0,
  }

  constructor(opts: { alg?: Alg; showTxFlow?: boolean; apiKey: string; n?: number }) {
    const { alg = 'sm2', showTxFlow = false, apiKey, n } = opts
    this.txnServices = new TransactionService({ apiKey })
    this.overViewServices = new OverviewService({ apiKey })

    this.alg = alg
    this.showTxFlow = showTxFlow

    if (typeof n !== 'undefined' && typeof n !== 'number') {
      throw 'n muse be number'
    }
    this.n = n ?? 3
  }

  getTx = async (hash: string) => {
    return this.txnServices.getTransactionByHash(hash)
  }

  private async compose(originalTxn: OriginalTxn) {
    const ret = await this.txnServices.compose(originalTxn)
    return ret.TxData
  }

  async sign(originalTxn: OriginalTxn, secretKey: Uint8Array | string, option?: AlgOption) {
    const t0 = Date.now()
    if (typeof secretKey === 'string') {
      secretKey = toUint8Array(secretKey)
    }
    const dioAddress = new DIOAddress(this.alg, secretKey)
    const txdata = await this.compose(originalTxn)

    this.duration.compose = Date.now() - t0
    const t1 = Date.now()

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

    this.duration.sign = Date.now() - t1
    const t2 = Date.now()

    // const signature = dataview.u8ToHex(signedInfo)
    // const isValid = await dioAddress.verifySignature(dataWithPK, signature, longPK!, option)

    this.duration.verify = Date.now() - t2
    const t3 = Date.now()
    // if (!isValid) {
    //   throw new Error('sign error')
    // }
    const finalInfo = dataview.concat(dataWithPK, signedInfo)
    const powDiff = new PowDifficulty({
      originTxn: finalInfo.buffer,
      ttl: originalTxn.ttl,
      n: this.n,
      debug: this.showTxFlow,
    })
    const finalInfowithNonce = powDiff.getHashMixinNonnce()
    this.duration.computedNonce = Date.now() - t3
    const hash = base32Encode(sha256.arrayBuffer(finalInfowithNonce), 'Crockford')
    this.duration.all = Date.now() - t0

    if (this.showTxFlow) {
      console.log('Tx Flow =>', this.duration)
    }

    return {
      composedTxDataWithPK: raw,
      signature: encode(signedInfo),
      longPK: encode(longPK!),
      rawTxData: encode(finalInfowithNonce),
      hash: hash.toLowerCase(),
      pk: encode(pk),
      txFlow: this.duration,
      nonceTime: powDiff.t,
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
    const { to, amount, secretKey, ttl, sender } = params
    if (!sender) {
      throw 'sender unfilled'
    }

    if (!isValidAddress(sender)) {
      throw 'invalid sender'
    }
    // const sender = await this.sk2base32Address(secretKey, this.alg)
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

  async sk2base32Address(sk: Uint8Array | string, alg: Alg) {
    if (typeof sk === 'string') {
      sk = toUint8Array(sk)
    }
    const dioAddress = new DIOAddress(alg, sk)
    const { address } = await dioAddress.generate()
    return address.toLowerCase()
  }
}

export { Transaction }
