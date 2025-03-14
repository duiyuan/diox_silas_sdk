import Request from './request'
import { GetProofsParams, Proof } from './type'

class ProofSvc extends Request {
  async getProofs(params: GetProofsParams): Promise<Proof[]> {
    const resp = await this.post<Proof[]>('proof.get', params)
    return resp
  }

  async checkProof(hash: string): Promise<boolean> {
    const resp = await this.post<{ Result: boolean }>('proof.check', { hash })
    return resp.Result
  }
}

export default ProofSvc
