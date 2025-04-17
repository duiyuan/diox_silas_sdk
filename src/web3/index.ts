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
  apiKey: string
  showDuration?: boolean
  n?: number
}

class Web3 {
  private net: Provider

  address: Address
  txn: Transaction
  block: Blocks
  overview: Overview
  proof: Proof
  account: Account

  constructor(net: Provider, opts: Options) {
    this.net = net || NET.TEST

    if (!opts?.apiKey) {
      throw 'unfilled authorization'
    }

    const options = {
      alg: 'sm2',
      showTxFlow: false,
      ...opts,
    }

    const { apiKey, n } = options
    provider.set(this.net)
    provider.setApiKey(options.apiKey)

    this.address = new Address({ apiKey })
    this.block = new Blocks({ apiKey })
    this.overview = new Overview({ apiKey })
    this.txn = new Transaction({ apiKey, n })
    this.proof = new Proof({ apiKey })
    this.account = new Account({ apiKey })

    // console.log('Dioxide initialized with net: ', this.net)
  }

  setProvider(net: Provider) {
    this.net = net
    provider.set(net)
  }
}

export { Web3 }
