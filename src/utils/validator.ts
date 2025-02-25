import base32Decode from 'base32-decode'
import base32Encode from 'base32-encode'
import crc32c from 'crc-32/crc32c'
import { concat } from './buffer'

export function isValidAddress(addr: string): boolean /* | undefined */ {
  try {
    const [addressStr] = addr.split(':')
    const address = new Uint8Array(base32Decode(addressStr, 'Crockford'))

    const publicKey = address.slice(0, 32)
    let errorCorrectingCode = crc32c.buf(publicKey, 3)

    errorCorrectingCode = (errorCorrectingCode & 0xfffffff0) | 0x3
    errorCorrectingCode = errorCorrectingCode >>> 0

    const buffer = new Int32Array([errorCorrectingCode]).buffer
    const errorCorrectingCodeBuffer = new Uint8Array(buffer)

    const mergedBuffer = concat(publicKey, errorCorrectingCodeBuffer)
    const encodedMergeBuffer = base32Encode(mergedBuffer, 'Crockford')

    return encodedMergeBuffer === addressStr.toUpperCase()
  } catch (error) {
    console.error('Exception ' + error)
    return false
  }
}
