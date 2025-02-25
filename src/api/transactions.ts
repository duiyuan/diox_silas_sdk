import provider from './provider'
import Request from './request'
import { DIOX, TxDetailResponse } from './type'

export function getComposeUrl() {
  const { rpc } = provider.get()
  const encodeUri = encodeURI(rpc + '/api?req=tx.compose')
  return encodeUri
}
export function getLimitUrl() {
  const { rpc } = provider.get()
  const encodeUri = encodeURI(rpc + '/api?req=tx.estimate_gas')
  return encodeUri
}
export function getSendUrl() {
  const { rpc } = provider.get()
  const encodeUri = encodeURI(rpc + '/api?req=tx.send')
  return encodeUri
}

export interface ExcutedTxCond {
  height: number
  limit?: number
  pos?: number
}

class TransactionService extends Request {
  compose(body: string) {
    return this.post<{
      err?: number
      rsp: string
      ret: { TxData: string; GasOffered: number }
    }>(getComposeUrl(), { body })
  }

  sendTransaction(body: string) {
    return this.post<{
      err?: number
      rsp: string
      ret: { Hash: string; Shard: number }
    }>(getSendUrl(), { body })
  }

  async getTransactionByHash(hash: string) {
    const { Status, Message, Result } = await this.get<CommonResponse<TxDetailResponse>>('', {
      data: {
        module: 'txn',
        action: 'details',
        hash,
      },
    })
    if (Status) throw Message
    return Result?.Content
  }

  async getDepositTx(params: ExcutedTxCond): Promise<DIOX.DepositTxSum[]> {
    const { limit = 500, pos = 0, height } = params
    const data = {
      limit,
      pos,
      height,
      module: 'txn',
      action: 'deposit',
    }
    const resp = await this.get<CommonResponse<DIOX.DepositTxSum[]>>('', {
      data,
    })
    const { Status, Message, Result } = resp
    if (Status) throw Message
    return Result
  }
}

export default TransactionService
