import base32Decode from 'base32-decode'
import base32Encode from 'base32-encode'
import crc32c from 'crc-32/crc32c'
import { concat } from './buffer'

export function validCRC(publicKey: Uint8Array, alg: string) {
  let code = 0

  switch (alg.toLowerCase()) {
    case 'ed25519':
      code = 0x3
      break
    case 'sm2':
      code = 0x4
      break
    default:
      throw 'Valid CRC failed, unsupported alg: ' + alg
  }

  let errorCorrectingCode = crc32c.buf(publicKey, code)

  errorCorrectingCode = (errorCorrectingCode & 0xfffffff0) | code
  errorCorrectingCode = errorCorrectingCode >>> 0
  return errorCorrectingCode
}

export function isValidAddress(addr: string): boolean /* | undefined */ {
  try {
    const [addressStr, alg] = addr.split(':')
    const address = new Uint8Array(base32Decode(addressStr, 'Crockford'))

    const publicKey = address.slice(0, 32)
    const errorCorrectingCode = validCRC(publicKey, alg)

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
