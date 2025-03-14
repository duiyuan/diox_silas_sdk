type Provider = string

interface KeyValue<T = any> {
  [props: string]: T
}

interface CommonResponse<T> {
  jsonrpc: '2.0'
  error?: {
    code: number
    message: string
  }
  result: T
  id: number | string | null
}
