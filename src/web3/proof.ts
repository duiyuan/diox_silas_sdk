import { Transaction } from './transaction'
import { GetProofsParams } from '../api/type'
import ProofService from '../api/proof'

export interface NewProofParams {
  sender: string
  ttl?: number
  key: string
  content: string
}

export interface NewProofByProofHashParams {
  sender: string
  ttl?: number
  proof_key: string
  content: string
}

class Proof {
  private tx: Transaction
  private proofSvc: ProofService
  constructor() {
    this.tx = new Transaction()
    this.proofSvc = new ProofService()
  }
  async newProof(privatekey: string | Uint8Array, params: NewProofParams) {
    const { sender, ttl, key, content } = params
    if (!privatekey || !sender) {
      throw `privatekey and sender is required`
    }
    return this.tx.send(
      {
        sender,
        gasprice: 100,
        function: 'silas.ProofOfExistence.new',
        args: {
          key,
          content,
        },
        ttl,
      },
      privatekey,
    )
  }

  async newProofByProofKey(privatekey: string | Uint8Array, params: NewProofByProofHashParams) {
    const { sender, ttl, proof_key, content } = params
    if (!privatekey || !sender) {
      throw `privatekey and sender is required`
    }
    return this.tx.send(
      {
        sender,
        gasprice: 100,
        function: 'silas.ProofOfExistence.newByProofKey',
        args: {
          proof_key,
          content,
        },
        ttl,
      },
      privatekey,
    )
  }

  async getProofs(params: GetProofsParams) {
    return this.proofSvc.getProofs(params)
  }

  async checkProof(proof_hash: string) {
    return this.proofSvc.checkProof(proof_hash)
  }
}

export default Proof
