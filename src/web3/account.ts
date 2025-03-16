import { Alg } from '../utils'
import Address from '../api/address'
import Request from '../api/request'
import { AddressGenerated } from '../utils/address/base'

interface RegsiterOption {
  id: string
  [key: string]: any
}

export default class Account extends Request {
  address: Address

  constructor() {
    super()

    this.address = new Address()
  }

  async generate(alg: Alg = 'sm2', privatekey?: Uint8Array | string): Promise<AddressGenerated> {
    return this.address.generate(alg, privatekey)
  }

  async register(options: RegsiterOption) {
    return this.post<boolean>('user.register', options)
  }

  async getRegState(options: RegsiterOption) {
    const { id, address } = options
    return this.post<boolean>('user.reg_state', {
      id,
      address,
    })
  }
}
