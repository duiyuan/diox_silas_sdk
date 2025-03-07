import Request from './request'
import { TxDetailResponse } from './type'

export interface ExcutedTxCond {
  height: number
  limit?: number
  pos?: number
}

class TransactionService extends Request {
  compose(composed: { [key: string]: any }) {
    return this.postToBC<{ TxData: string; GasOffered: number }>('tx.compose', composed)
  }

  sendTransaction(signedText: { [key: string]: any }) {
    return this.post<{ Hash: string; Shard: number }>('tx.send', signedText)
  }

  async getTransactionByHash(hash: string) {
    const resp = await this.post<TxDetailResponse>('chain.txn_detail', {
      hash,
    })
    return resp
  }
}

export default TransactionService
