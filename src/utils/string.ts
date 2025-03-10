import BigNumber from 'bignumber.js'
import json from 'json-bigint'

export const shakeKeyValue = (params: KeyValue | undefined) => {
  if (params && typeof params === 'object') {
    Object.keys(params).forEach((key) => {
      const val = params[key]
      if (['', undefined, null].includes(val)) {
        delete params[key]
      }
    })
    return params
  }
  return params
}

export const bignumberMult = (val1: number | string, val2: BigNumber.Value) => {
  return new BigNumber(val1).multipliedBy(val2).toFixed()
}

export const bignumberMinus = (val1: BigNumber.Value, val2: BigNumber.Value) => {
  return new BigNumber(val1).minus(new BigNumber(val2))
}

export const bignumberPlus = (val1: BigNumber.Value, val2: BigNumber.Value) => {
  return new BigNumber(val1).plus(new BigNumber(val2))
}

export const bignumberPow = (val1: BigNumber.Value, power: number) => {
  return new BigNumber(val1).pow(power)
}

export const bignumberDiv = (v1: BigNumber.Value, v2: BigNumber.Value) => {
  return new BigNumber(v1).dividedBy(v2)
}

export const bignumberLt = (v1: BigNumber.Value, v2: BigNumber.Value) => {
  return new BigNumber(v1).lt(v2)
}

export const toTokenAmount = (amount: string, decimals: number) => {
  return bignumberDiv(amount, new BigNumber(10).pow(decimals)).toString()
}

export const fullAddress = (address: string) => {
  if (!address) return ''
  if (address.includes(':')) {
    return address
  }
  return address + ':sm2'
}

export const stringify = (content: any) => {
  return json.stringify(content)
}

export const parse = (content: string) => {
  return json.parse(content)
}
