type Provider = string

interface KeyValue<T = any> {
  [props: string]: T
}

interface CommonResponse<T> {
  Status: number
  Message: string
  Result: T
}
