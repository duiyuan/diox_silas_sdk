class SingleProvider {
  private dioxide: string
  private rpc: string
  private token = ''

  constructor() {
    this.dioxide = ''
    this.rpc = ''
  }

  get apiKey() {
    return this.token
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

  setApiKey(apiKey: string) {
    this.token = apiKey
  }
}

export default new SingleProvider()
