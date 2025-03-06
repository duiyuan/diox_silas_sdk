import fetch, { Response, RequestInit } from 'node-fetch'
import { stringify } from '../utils/string'
import provider from './provider'
import { composeParams } from './rpc'

const TIMEOUT = 30 * 1000

function checkStatus(response: Response) {
  if (response.ok) {
    return response
  } else {
    return Promise.reject(response)
  }
}

export default class Fetcher {
  prune = (url: string) => (url.endsWith('/') ? url.slice(0, -1) : url)

  async postToBC<T>(action: string, payload: { [key: string]: any }): Promise<T> {
    const { dioxide } = provider.get()
    const body = composeParams(action, true, payload)

    const options: RequestInit = {
      method: 'post',
      body: stringify(body),
      timeout: TIMEOUT,
    }
    const resp = await fetch(dioxide + '/api/jsonrpc/v1', options)
      .then(checkStatus)
      .then((r) => r.json())

    const { error, result } = resp
    if (error) {
      throw error.message
    }
    return result
  }

  async post<T>(action: string, payload: any = {}, toBCRPC = false): Promise<T> {
    const { dioxide } = provider.get()
    const body = composeParams(action, false, payload)

    const options: RequestInit = {
      method: 'post',
      body: stringify(body),
      timeout: TIMEOUT,
    }
    const resp = await fetch(dioxide + '/api/jsonrpc/v1', options)
      .then(checkStatus)
      .then((r) => r.json())

    const { error, result } = resp
    if (error) {
      throw error.message
    }
    return result
  }
}
