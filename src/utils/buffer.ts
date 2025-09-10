import { dataview } from '@dioxide-js/misc'
import isBase64 from 'is-base64'
import { sha256, Message } from 'js-sha256'
import encode from 'base32-encode'

export function concat(...args: (ArrayBuffer | Uint8Array)[]) {
  let length = 0
  const units = args.map((arg) => {
    return new Uint8Array(arg)
  })

  // Get the total length of all arrays.
  units.forEach((item) => {
    length += item.length
  })

  // Create a new array with total length and merge all source arrays.
  const mergedArray = new Uint8Array(length)
  let offset = 0
  units.forEach((item) => {
    mergedArray.set(item, offset)
    offset += item.length
  })
  // Should print an array with length 90788 (5x 16384 + 8868 your source arrays)
  return mergedArray
}

export function stringToUint8Array(message: string): Uint8Array {
  return new TextEncoder().encode(message)
}

export function uint8ArrayToString(content: Uint8Array) {
  return new TextDecoder('utf-8').decode(content)
}

export function areUint8ArraysEqual(arr1: Uint8Array, arr2: Uint8Array) {
  if (arr1.length !== arr2.length) {
    return false
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }

  return true
}

export function isHex(hex: string) {
  hex = hex.replace(/^0x/, '')
  return /^[0-9a-fA-F]+$/.test(hex)
}

export function toUint8Array(s: string | Uint8Array) {
  if (s instanceof Uint8Array) {
    return s
  }

  if (s.startsWith('0x') && isHex(s)) {
    s = s.replace(/^0x/, '')
    return dataview.hexToU8(s)
  }

  if (isBase64(s)) {
    return dataview.base64ToU8(s)
  }

  throw `illegal input, expect base64-string, base16-string or Uint8Array`
}

export function toProofKeyHash(message: Message): string {
  const hex = sha256(message)
  const msg = dataview.hexToU8(hex)
  return encode(msg, 'Crockford')
}
