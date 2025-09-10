import { NET } from '../constants'
import Address from '../api/address'
import { Transaction, TxOption, SignMethod } from './transaction'
import Account from './account'
import provider from '../api/provider'
import Blocks from '../api/block'
import Overview from '../api/overview'
import Proof from './proof'

class Web3 {
  private net: Provider

  address: Address
  txn: Transaction
  block: Blocks
  overview: Overview
  proof: Proof
  account: Account

  constructor(net: Provider, opts: TxOption) {
    this.net = net || NET.TEST

    if (!opts?.apiKey) {
      throw 'unfilled authorization'
    }

    const options: TxOption = {
      alg: 'sm2',
      showTxFlow: false,
      ...opts,
    }

    const { apiKey } = options
    provider.set(this.net)
    provider.setApiKey(options.apiKey)

    this.address = new Address({ apiKey })
    this.block = new Blocks({ apiKey })
    this.overview = new Overview({ apiKey })
    this.txn = new Transaction(options)
    this.proof = new Proof(options)
    this.account = new Account({ apiKey })

    // console.log('Dioxide initialized with net: ', this.net)
  }

  setProvider(net: Provider) {
    this.net = net
    provider.set(net)
  }
}

export { Web3, type SignMethod }
