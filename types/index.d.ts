type Provider = string | { dioxide: string; rpc: string }

interface KeyValue<T = any> {
  [props: string]: T
}

interface CommonResponse<T> {
  Status: number
  Message: string
  Result: T
}
