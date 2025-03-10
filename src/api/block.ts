import Request from './request'
import { DIOX } from './type'

class BlockSvc extends Request {
  async getExcutedTx(params: { height: number; limit?: number; pos?: number }): Promise<DIOX.ExcutedTx | undefined> {
    const { limit = 500, pos = 0, height } = params
    const data = {
      limit,
      pos,
      height,
    }
    const resp = await this.post<DIOX.ExcutedTx>('chain.txn_history', data)
    return resp
  }
}

export default BlockSvc
