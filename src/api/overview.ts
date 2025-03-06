import Request from './request'
import { DIOX } from './type'

class OverviewService extends Request {
  async chainStatus() {
    const resp = await this.post<DIOX.ChainStatus>('chain.status', {})
    return resp
  }

  async getGasPrice() {
    const Result = await this.chainStatus()
    return Result.AvgGasPrice || 0
  }
}

export default OverviewService
