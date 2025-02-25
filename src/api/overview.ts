import Request from './request'
import { DioxScanChainBasicInfo } from './type'

class OverviewService extends Request {
  async chainStatus() {
    const resp = await this.get<DioxScanChainBasicInfo>('', {
      data: {
        module: 'chain',
        action: 'status',
      },
    })
    const { Status, Message, Result } = resp
    if (Status) throw Message
    return Result
  }

  async getGasPrice() {
    const Result = await this.chainStatus()
    return Result.AvgGasPrice || 0
  }
}

export default OverviewService
