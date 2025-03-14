import Request from './request'
import { GetProofsParams, Proof } from './type'

class ProofSvc extends Request {
  async getProofs(params: GetProofsParams): Promise<Proof[]> {
    const resp = await this.post<Proof[]>('proofs.get', params)
    return resp
  }

  async checkProof(hash: string): Promise<boolean> {
    const resp = await this.post<boolean>('proofs.check', hash)
    return resp
  }
}

export default ProofSvc
