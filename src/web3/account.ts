import { Alg } from '../utils'
import Address from '../api/address'
import Request from '../api/request'
import { AddressGenerated } from '../api/type'

interface RegsiterOption {
  id: string
  [key: string]: any
}

export default class Account extends Request {
  address: Address

  constructor(opts: { apiKey: string }) {
    super(opts)

    this.address = new Address(opts)
  }

  async generate(alg: Alg = 'sm2', privatekey?: Uint8Array | string): Promise<AddressGenerated> {
    return this.address.generate(alg, privatekey)
  }

  async register(options: RegsiterOption): Promise<Credential> {
    return this.post<Credential>('user.register', options)
  }

  async getState(options: RegsiterOption) {
    const { id, address } = options
    return this.post<boolean>('user.state', { id, address })
  }
}
