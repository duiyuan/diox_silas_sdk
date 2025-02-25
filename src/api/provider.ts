import { getProvider } from '../constants'

class SingleProvider {
  private dioxide: string
  private rpc: string

  constructor() {
    this.dioxide = ''
    this.rpc = ''
  }

  get() {
    return {
      dioxide: this.dioxide,
      rpc: this.rpc,
    }
  }

  set(net: Provider) {
    const { dioxide, rpc } = getProvider(net)
    this.dioxide = dioxide
    this.rpc = rpc
  }
}

export default new SingleProvider()
