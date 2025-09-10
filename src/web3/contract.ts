import Request from '../api/request'
import ContractService from '../api/contract'
import { OriginalTxn } from '../api/type'
import { Transaction } from './transaction'

interface DeployContractParams extends OriginalTxn {
  code: string[]
  cargs: string[]
  time?: number
  delegatee: string
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

  abi(name: string) {
    return this.contractSvc.abi(name)
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
}
