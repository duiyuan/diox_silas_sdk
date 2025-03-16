export * from './buffer'
export * from './string'
export * from './validator'
export * from './extractPublicKey'
export * from './getAddressShardIndex'
export * from './address'

export const isUndefined = (input: any) => {
  return typeof input === 'undefined'
}
