import { decode, encode } from 'base64-arraybuffer'
import { sha256 } from 'js-sha256'
import * as ed from '@noble/ed25519'
import base32Encode from 'base32-encode'

import TransactionService, { ExcutedTxCond } from '../api/transactions'
import { concat, fullAddress, pk2Address } from '../utils'
import { extractPublicKey } from '../utils'
import PowDifficulty from '../utils/powDifficulty'
import OverviewService from '../api/overview'
import { OriginalTxn } from '../api/type'

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
    const { ret, err } = await this.txnServices.compose(JSON.stringify(originalTxn))
    if (err) {
      throw new Error(ret.toString())
    }
    return ret.TxData
  }

  async sign(originalTxn: OriginalTxn, secretKey: Uint8Array) {
    const unit8ArraySecrectKey = secretKey
    const txdata = await this.compose(originalTxn)
    const pk = extractPublicKey(originalTxn.sender)
    if (!pk) {
      throw new Error('pk error')
    }
    const dataWithPK = this.insertPK(txdata, [{ encryptedMethodOrderNumber: 0x3, publicKey: new Uint8Array(pk) }])
    const signedInfo = await ed.sign(dataWithPK, unit8ArraySecrectKey)
    const isValid = await ed.verify(signedInfo, dataWithPK, pk)
    if (!isValid) {
      throw new Error('sign error')
    }
    const finalInfo = concat(dataWithPK, signedInfo)
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
    const { rawTxData: signData } = await this.sign(originTxn, secretKey)
    const { ret, err } = await this.txnServices.sendTransaction(
      JSON.stringify({
        txdata: signData,
      }),
    )
    if (err) {
      throw new Error(ret.toString())
    }
    return ret.Hash
  }

  async sendRawTx(rawTxData: string) {
    const { ret, err } = await this.txnServices.sendTransaction(
      JSON.stringify({
        txdata: rawTxData,
      }),
    )
    if (err) {
      throw new Error(ret.toString())
    }
    return ret.Hash
  }

  private insertPK(
    txData: string,
    pkList: { encryptedMethodOrderNumber: number; publicKey: Uint8Array }[],
  ): Uint8Array {
    const originTxData = new Uint8Array(decode(txData))

    const secSuites: Uint8Array[] = []
    pkList.forEach((el) => {
      const id = new Uint8Array([el.encryptedMethodOrderNumber])
      const pk = el.publicKey
      secSuites.push(id)
      secSuites.push(pk)
    })
    const result = concat(originTxData, ...secSuites)
    return result
  }

  async getEstimatedFee(originTxn: OriginalTxn) {
    const { function: func, args, delegatee, scale = 3, tokens } = originTxn
    const overview = await this.overViewServices.chainStatus()
    const avgGasPrice = overview?.AvgGasPrice || 0
    const to = args.to || args.To

    const { ret, err } = await this.txnServices.compose(
      JSON.stringify({
        sender: to,
        gasprice: avgGasPrice,
        delegatee: delegatee,
        function: func,
        args,
        tokens,
      }),
    )
    if (err) {
      throw new Error('services.compose failed: txdata is empty(' + ret.toString() + ')')
    }

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

  getDepositTxByBlock(params: ExcutedTxCond) {
    return this.txnServices.getDepositTx(params)
  }

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
    const sender = await this.sk2base32Address(secretKey)
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
    const sender = await this.sk2base32Address(secretKey)
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

  private async sk2base32Address(sk: Uint8Array) {
    const pk = await ed.getPublicKey(sk)
    const { address } = pk2Address(pk)
    return fullAddress(base32Encode(address, 'Crockford').toLocaleLowerCase())
  }
}

export { Transaction }
