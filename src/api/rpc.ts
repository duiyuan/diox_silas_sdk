let gid = 0

export const BCRPC_Module = 'bcrpc'

export interface JSONRPCParam {
  method: string
  id: number
  params: any
  jsonrpc: '2.0'
}

export interface JSONRPCResp<T> {
  jsonrpc: '2.0'
  id: number
  result: T
  err: {
    code: number
    message: string
  }
}

export function composeParams(method: string, toBCRPC = false, params = {}): JSONRPCParam {
  const schema: JSONRPCParam = {
    jsonrpc: '2.0',
    method,
    params: params,
    id: gid++,
  }

  if (toBCRPC) {
    const m = method.replace('.', '-')
    schema.method = BCRPC_Module + '.' + m
  }
  return schema
}
