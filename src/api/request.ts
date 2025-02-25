import querystring from 'query-string'
import json from 'json-bigint'
import fetch, { Response, RequestInit } from 'node-fetch'
import { shakeKeyValue } from '../utils/string'
import provider from './provider'

const AbortController = globalThis.AbortController

function checkStatus(response: Response) {
  if (response.ok) {
    return response
  } else {
    return Promise.reject(response)
  }
}

export default class Fetcher {
  prune = (url: string) => (url.endsWith('/') ? url.slice(0, -1) : url)

  get<T>(service: string, options: any): Promise<T> {
    return new Promise((res) => {
      const { dioxide } = provider.get()
      options = { credentials: 'omit', ...options }

      let absoluteUrl = service.startsWith('http') ? service : dioxide + service

      if (options.data) {
        const data = shakeKeyValue(options.data) || {}
        absoluteUrl += '?' + querystring.stringify(data, { encode: false })
      }

      const controller = new AbortController()
      options.signal = controller.signal
      const timeout = setTimeout(() => {
        controller.abort()
      }, 30000)

      fetch(absoluteUrl, options)
        .then(checkStatus)
        .then((r) => r.text().then((text) => res(json.parse(text))))
        .finally(() => {
          clearTimeout(timeout)
        })
    })
  }

  post<T>(service: string, options: any = {}): Promise<T> {
    return new Promise((res) => {
      const { dioxide } = provider.get()
      const { body } = options
      const absoluteUrl = service.startsWith('http')
        ? service
        : dioxide + (service.startsWith('/') ? service.slice(1) : service)

      const controller = new AbortController()
      const concatOption: RequestInit = {
        ...options,
        method: 'post',
        body,
        signal: controller.signal,
      }
      const timeout = setTimeout(() => {
        controller.abort()
      }, 30000)

      fetch(absoluteUrl, concatOption)
        .then(checkStatus)
        .then((r) => r.json().then((json) => res(json as T)))
        .finally(() => {
          clearTimeout(timeout)
        })
    })
  }
}
