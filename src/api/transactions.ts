import Request from './request'
import { DIOX, TxDetailResponse } from './type'

export interface ExcutedTxCond {
  height: number
  limit?: number
  pos?: number
}

class TransactionService extends Request {
  compose(composed: string) {
    return this.postToBC<{ TxData: string; GasOffered: number }>('tx.compose', { body: composed })
  }

  sendTransaction(signedText: string) {
    return this.post<{ Hash: string; Shard: number }>('tx.send', { body: signedText })
  }

  async getTransactionByHash(hash: string) {
    const resp = await this.post<TxDetailResponse>('chain.txn_detail', {
      hash,
    })
    return resp
  }
}

export default TransactionService
