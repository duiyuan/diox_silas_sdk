import Request from './request'
import { DIOX } from './type'

class BlockSvc extends Request {
  async getExcutedTx(params: {
    height: number
    limit?: number
    pos?: number
    shardindex?: number
  }): Promise<DIOX.ExcutedTx | undefined> {
    const { limit = 200, pos = 0, height, shardindex } = params
    const data = {
      limit,
      pos,
      height,
      shardindex,
    }
    const resp = await this.post<DIOX.ExcutedTx>('chain.txn_history', data)
    return resp
  }

  async getHistory(params: {
    height: number
    limit?: number
    pos?: number
    shardindex?: number
  }): Promise<DIOX.Block[] | undefined> {
    const { limit = 200, pos = 0, height, shardindex } = params
    const data = {
      limit,
      pos,
      height,
      shardindex,
    }
    const resp = await this.post<DIOX.Block[]>('chain.block_history', data)
    return resp
  }

  async detail(hash: string) {
    return this.post<DIOX.Block>('chain.block_detail', { hash })
  }
}

export default BlockSvc
