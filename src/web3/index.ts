import { NET } from '../constants'
import Address from '../api/address'
import { Transaction } from './transaction'
import provider from '../api/provider'
import Blocks from '../api/block'
import Overview from '../api/overview'
import { LIB_VERSION } from '../constants/version'

class Web3 {
  private net: Provider

  addr: Address
  txn: Transaction
  blocks: Blocks
  overview: Overview

  constructor(net: Provider) {
    this.net = net || NET.TEST
    provider.set(this.net)

    this.addr = new Address()
    this.blocks = new Blocks()
    this.overview = new Overview()
    this.txn = new Transaction()

    console.log('Dioxide initialized with net: ', this.net)
  }

  setProvider(net: Provider) {
    this.net = net
    provider.set(net)
  }

  static version() {
    return LIB_VERSION
  }
}

export { Web3 }
