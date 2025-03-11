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

  set(endpoint: string, rpc?: string) {
    if (endpoint) {
      this.dioxide = endpoint
    }
    if (rpc) {
      this.rpc = endpoint
    }
  }
}

export default new SingleProvider()
