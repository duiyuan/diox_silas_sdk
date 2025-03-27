import { NET } from '../constants'
import Address from '../api/address'
import { Transaction } from './transaction'
import Account from './account'
import provider from '../api/provider'
import Blocks from '../api/block'
import Overview from '../api/overview'
import Proof from './proof'
import { Alg } from '../utils'

interface Options {
  alg?: Alg
  showDuration?: boolean
}

class Web3 {
  private net: Provider

  address: Address
  txn: Transaction
  block: Blocks
  overview: Overview
  proof: Proof
  account: Account

  constructor(net: Provider, opts: Options = {}) {
    this.net = net || NET.TEST
    provider.set(this.net)

    const options = {
      alg: 'sm2',
      showTxFlow: false,
      ...opts,
    }

    this.address = new Address()
    this.block = new Blocks()
    this.overview = new Overview()
    this.txn = new Transaction(options.alg as Alg, options.showTxFlow)
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
