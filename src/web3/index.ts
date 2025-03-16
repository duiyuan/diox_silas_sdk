import { NET } from '../constants'
import Address from '../api/address'
import { Transaction } from './transaction'
import Account from './account'
import provider from '../api/provider'
import Blocks from '../api/block'
import Overview from '../api/overview'
import Proof from './proof'

class Web3 {
  private net: Provider

  address: Address
  txn: Transaction
  blocks: Blocks
  overview: Overview
  proof: Proof
  account: Account

  constructor(net: Provider) {
    this.net = net || NET.TEST
    provider.set(this.net)

    this.address = new Address()
    this.blocks = new Blocks()
    this.overview = new Overview()
    this.txn = new Transaction()
    this.proof = new Proof()
    this.account = new Account()

    // console.log('Dioxide initialized with net: ', this.net)
  }

  setProvider(net: Provider) {
    this.net = net
    provider.set(net)
  }
}

export { Web3 }
