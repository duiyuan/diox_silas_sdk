import Request from './request'

export interface ContractFunction {
  name: string
  flag: string
  scope: string
  opcode: number
  signature: string
  args?: { [key: string]: any }[]
}

export interface ContractInterfaces {
  [key: string]: any
}

export interface ContractData {
  ContractID: number
  ContractVersionID: number
  Contract: string
  Hash: string
  ImplmentedInterfaces: any[]
  StateVariables: any[]
  Scopes: {
    address: string
  }
  ScatteredMaps: Record<string, any>
  Structs: any[]
  Enumerables: any[]
  Interfaces: ContractInterfaces
  Functions: ContractFunction[]
}

class ContractService extends Request {
  info(contractName: string): Promise<ContractData> {
    return this.postToBC<ContractData>('dx.contract_info', { contract: contractName })
  }

  async abi(contractName: string): Promise<ContractFunction[]> {
    const info = await this.info(contractName)
    return info.Functions
  }
}

export default ContractService
