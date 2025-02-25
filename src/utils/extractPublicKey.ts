// import base32Encode from "base32-encode"
import base32Decode from 'base32-decode'
import crc32c from 'crc-32/crc32c'
import { areUint8ArraysEqual, concat } from './buffer'

export function extractPublicKey(address: string): Uint8Array | null {
  const [splitAddr] = address.split(':')
  const addressUintArr = new Uint8Array(base32Decode(splitAddr, 'Crockford'))
  const publicKey = addressUintArr.slice(0, 32)
  const checkAddrUintArr = PK2Addr(publicKey)
  if (areUint8ArraysEqual(addressUintArr, checkAddrUintArr)) {
    return publicKey
  }

  return null
}

function PK2Addr(publicKey: Uint8Array) {
  const rollingCRC = 3
  const encryptMethod = 0x3
  let errorCorrectingCode = crc32c.buf(publicKey, rollingCRC)
  errorCorrectingCode = (errorCorrectingCode & 0xfffffff0) | encryptMethod
  errorCorrectingCode = errorCorrectingCode >>> 0
  const buffer = new Int32Array([errorCorrectingCode]).buffer
  const errorCorrectingCodeBuffer = new Uint8Array(buffer)
  const mergedBuffer = concat(publicKey, errorCorrectingCodeBuffer)
  return mergedBuffer
}
