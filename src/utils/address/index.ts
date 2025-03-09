import { decode } from 'base64-arraybuffer'
import base32Decode from 'base32-decode'
import crc32c from 'crc-32/crc32c'

import DIOSM2 from './sm2'
import DIOEd25519 from './ed25519'
import ECDSA from './ecdsa'
import GenericAddress from './base'
import { areUint8ArraysEqual, concat } from '../buffer'

type Alg = 'sm2' | 'ed25519' | 'ecdsa'

interface PKItem {
  encryptedMethodOrderNumber: number
  publicKey: Uint8Array
}

export class DIOAddress {
  alg: Alg = 'sm2'
  methodNum = 0x4

  privateKey: Uint8Array | null = null
  instance: GenericAddress | null = null

  constructor(alg: Alg, privateKey?: Uint8Array) {
    this.alg = alg

    if (privateKey) {
      this.privateKey = privateKey
    }

    switch (alg) {
      case 'sm2':
        this.methodNum = 0x4
        this.instance = new DIOSM2({ privateKey: privateKey })
        break
      case 'ed25519':
        this.methodNum = 0x3
        this.instance = new DIOEd25519({ privateKey: privateKey })
        break
      case 'ecdsa':
        this.methodNum = 0x4
        this.instance = new ECDSA({ privateKey: privateKey })
        break
      default:
        throw 'DIOAddress ERROR: unsupported alg:' + this.alg
    }
  }

  getPubicKeyFromPrivateKey(privatekey: string | Uint8Array) {
    return this.instance!.getPubicKeyFromPrivateKey(privatekey)
  }

  generate() {
    return this.instance!.generate()
  }

  sign(content: string | number[] | Uint8Array, privateKey: Uint8Array) {
    return this.instance!.sign(content, privateKey)
  }

  verifySignature(msg: string | number[] | Uint8Array, signedHex: string, publicKey: Uint8Array) {
    return this.instance!.verify(msg, signedHex, publicKey)
  }

  addressToPublicKey(address: string): Uint8Array | null {
    const [splitAddr] = address.split(':')
    const addressUintArr = new Uint8Array(base32Decode(splitAddr, 'Crockford'))
    const publicKey = addressUintArr.slice(0, 32)
    const checkAddrUintArr = this.PK2Addr(publicKey)
    if (areUint8ArraysEqual(addressUintArr, checkAddrUintArr)) {
      return publicKey
    }
    return null
  }

  insertPKIntoTxData(txData: string, pkList: PKItem[]): Uint8Array {
    const originTxData = new Uint8Array(decode(txData))

    const secSuites: Uint8Array[] = []
    pkList.forEach((el) => {
      const id = new Uint8Array([el.encryptedMethodOrderNumber])
      const pk = el.publicKey
      secSuites.push(id)
      secSuites.push(pk)
    })
    const result = concat(originTxData, ...secSuites)
    return result
  }

  private PK2Addr(publicKey: Uint8Array) {
    const rollingCRC = this.methodNum
    const encryptMethod = this.methodNum
    let errorCorrectingCode = crc32c.buf(publicKey, rollingCRC)
    errorCorrectingCode = (errorCorrectingCode & 0xfffffff0) | encryptMethod
    errorCorrectingCode = errorCorrectingCode >>> 0
    const buffer = new Int32Array([errorCorrectingCode]).buffer
    const errorCorrectingCodeBuffer = new Uint8Array(buffer)
    const mergedBuffer = concat(publicKey, errorCorrectingCodeBuffer)
    return mergedBuffer
  }
}
