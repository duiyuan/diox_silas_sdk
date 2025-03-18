import axios, { AxiosRequestConfig } from 'axios'
import provider from './provider'
import { composeParams } from './rpc'

const TIMEOUT = 30 * 1000

export default class Fetcher {
  prune = (url: string) => (url.endsWith('/') ? url.slice(0, -1) : url)

  async postToBC<T>(action: string, payload: { [key: string]: any }, opts: AxiosRequestConfig = {}): Promise<T> {
    return this.post(action, payload, true, opts)
  }

  async post<T>(action: string, payload: any = {}, toBC = false, opts: AxiosRequestConfig = {}): Promise<T> {
    const { dioxide } = provider.get()
    const host = this.prune(dioxide)
    const data = composeParams(action, toBC, payload)

    const options: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: TIMEOUT,
      ...opts,
    }
    const resp: CommonResponse<T> = await axios.post(host + '/api/jsonrpc/v1', data, options).then((r) => r.data)

    const { error, result } = resp
    if (error) {
      throw error.message
    }
    return result
  }
}
