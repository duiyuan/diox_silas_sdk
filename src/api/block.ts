import Request from './request'
import { DIOX } from './type'

class BlockSvc extends Request {
  async getExcutedTx(params: { height: number; limit?: number; pos?: number }): Promise<DIOX.ExcutedTx | undefined> {
    const { limit = 500, pos = 0, height } = params
    const data = {
      limit,
      pos,
      height,
      module: 'block',
      action: 'txn_executed',
    }
    const resp = await this.get<CommonResponse<DIOX.ExcutedTx>>('', {
      data,
    })
    const { Status, Message, Result } = resp
    if (Status) throw Message
    return Result
  }
}

export default BlockSvc
