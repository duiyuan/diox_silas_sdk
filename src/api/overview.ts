import Request from './request'
import { DIOX, TxSumList, DIOXScanReq } from './type'

class OverviewService extends Request {
  async chainStatus() {
    const resp = await this.post<DIOX.ChainStatus>('chain.status', {})
    return resp
  }

  async getGasPrice() {
    const Result = await this.chainStatus()
    return Result.AvgGasPrice || 0
  }

  getTxHistory = async (params: DIOXScanReq.History): Promise<TxSumList> => {
    return this.post('chain.txn_history', params)
  }
}

export default OverviewService
