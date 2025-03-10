import { fullAddress, isValidAddress } from '../utils'
import Request from './request'
import { AddrBaseInfo, BalanceItem, DIOX, DioxScanTxResponse } from './type'

type ListParmas = {
  address?: string
  addresstxntype?: string
  shardIndex?: string
  height?: number
  pos?: number
  limit?: number
}

// interface RefundItem {
//   Shard: number
//   Token: string
//   Amount: string
// }

class AddressService extends Request {
  private checkAddress(address: string) {
    if (!address || !isValidAddress(address)) {
      throw new Error('Address is not valid')
    }
  }

  async getISN(address: string) {
    const fullAddr = fullAddress(address)
    this.checkAddress(fullAddr)
    const resp = await this.postToBC<{ ISN: number }>('dx.isn', { address: fullAddr })
    return resp?.ISN || 0
  }

  getTxnListByAddress(params?: ListParmas) {
    return this.post<DioxScanTxResponse>('chain.address_listtxn', params)
  }

  getAddressState(data: { address: string; contract: string }) {
    return this.post<AddrBaseInfo>('chain.address_state', data)
  }

  getAddressInfo(address: string) {
    if (typeof address !== 'string') {
      throw `getDetailInfo error: address should be string`
    }
    const fullAddr = fullAddress(address)
    const addr = fullAddr.replace(/#/g, '%23')
    return this.post<DIOX.Address>('chain.address_profile', { address: addr })
  }

  getBalance(address: string): Promise<BalanceItem> {
    const fullAddr = fullAddress(address)
    this.checkAddress(fullAddr)
    const addr = fullAddr.replace(/#/g, '%23')
    return this.post<BalanceItem>('chain.address_balance', { address: addr })
  }
}

export default AddressService
