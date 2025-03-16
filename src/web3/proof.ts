import { Transaction } from './transaction'
import { GetProofsParams } from '../api/type'
import ProofService from '../api/proof'

export interface NewProofParams {
  sender: string
  secretKey: Uint8Array
  ttl?: number
  key: string
  content: string
}

export interface NewProofByProofHashParams {
  sender: string
  secretKey: Uint8Array
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
  async newProof(params: NewProofParams) {
    const { sender, secretKey, ttl, key, content } = params
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
      secretKey,
    )
  }

  async newProofByProofKey(params: NewProofByProofHashParams) {
    const { sender, secretKey, ttl, proof_key, content } = params
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
      secretKey,
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
