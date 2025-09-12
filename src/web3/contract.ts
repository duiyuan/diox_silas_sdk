import Request from '../api/request'
import ContractService from '../api/contract'
import { OriginalTxn } from '../api/type'
import { Transaction } from './transaction'

interface DeployContractParams extends Omit<OriginalTxn, 'function' | 'args'> {
  code: string[]
  cargs: string[]
  time?: number
  delegatee: string
}

interface ExecContractParams {
  func: string
  args: any
  sender: string
}

interface ABISubItem {
  [key: string]: string
}

export default class Contract extends Request {
  contractSvc: ContractService
  private tx: Transaction

  constructor(opts: { apiKey: string }) {
    super(opts)
    this.contractSvc = new ContractService(opts)
    this.tx = new Transaction(opts)
  }

  info(name: string) {
    return this.contractSvc.info(name)
  }

  async abi(name: string) {
    const items = await this.contractSvc.abi(name)
    const composed = items.map((item) => {
      const { signature } = item
      if (signature) {
        const chunks = signature.split(' ')
        const results: ABISubItem[] = []
        for (let i = 0; i < chunks.length; i += 2) {
          const sub: ABISubItem = {}
          sub[chunks[i + 1]] = chunks[i]
          results.push(sub)
        }
        item.args = results
        return item
      }
    })
    return composed
  }

  async mint(privatekey: string | Uint8Array, sender: string, amount = '1000000000000000000') {
    return this.tx.send(privatekey, {
      sender,
      function: 'core.coin.mint',
      args: { Amount: amount },
    })
  }

  async createDApp(privatekey: string | Uint8Array, sender: string, dapp: string) {
    return this.tx.send(privatekey, {
      sender,
      function: 'core.delegation.create',
      args: { Type: 10, Name: dapp, Deposit: '100000000' },
    })
  }

  async deploy(privatekey: string | Uint8Array, params: DeployContractParams) {
    const { ttl, code, cargs, delegatee, time = 20 } = params
    if (!privatekey || !delegatee) {
      throw `both privatekey and delegatee(dapp name) are required`
    }
    return this.tx.send(privatekey, {
      delegatee,
      gasprice: 100,
      function: 'core.delegation.deploy_contracts',
      args: { code, cargs, time },
      ttl,
    })
  }

  async run(privatekey: string | Uint8Array, params: ExecContractParams) {
    const { args, func, sender } = params
    if (!privatekey && !sender) {
      throw `both privatekey and sender are required`
    }

    const isFunc = typeof func === 'string' && func.split('.').length === 3
    if (!isFunc) {
      throw `bad func for exexcution, the format must be: <dapp>.<contract>.<function>`
    }

    return this.tx.send(privatekey, { gasprice: 100, function: func, args, sender })
  }
}
