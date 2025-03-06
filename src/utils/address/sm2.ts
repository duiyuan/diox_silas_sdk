import * as smcrypto from 'sm-crypto'
import { dataview } from '@dioxide-js/misc'
import crc32c from 'crc-32/crc32c.js'
import base32Encode from 'base32-encode'

import GenericAddress from './interface'

const sm2 = smcrypto.sm2
const sm3 = (smcrypto as any).default.sm3

console.log(typeof sm3)

interface Options {
  privateKey?: string
}

export default class DIOSM2 implements GenericAddress {
  private privateKey?: string

  constructor(options?: Options) {
    if (options?.privateKey) {
      this.privateKey = this.trim(options?.privateKey)
    }
  }

  private trim(str: string) {
    return str.trim().replace(/^0x/, '')
  }

  generate() {
    const [pk, sk] = this.keyPaires() as [string, string]
    const publickKeyU8 = dataview.hexToU8(pk!)
    const sku8 = dataview.hexToU8(sk!)

    const pku8 = publickKeyU8[0] === 4 ? publickKeyU8.slice(1) : publickKeyU8
    const pkHash = sm3(pku8)
    const u8 = dataview.hexToU8(pkHash)
    const o = this.pkToDIOStruct(u8, 4)
    const address = base32Encode(o.address, 'Crockford')
    return { pk, sk, pku8: publickKeyU8, sku8, address }
  }

  getPubicKeyFromPrivateKey(privateKeyHex: string) {
    const publicKey = (sm2 as any).getPublicKeyFromPrivateKey(privateKeyHex)
    return publicKey
  }

  private pkToDIOStruct(
    publicKey: Uint8Array,
    rollingCRC = 4,
    encryptMethod = 0x4, // ed25519 -> 3, sm2 -> 4
    salt = 1,
    alias?: string,
  ) {
    let errorCorrectingCode = crc32c.buf(publicKey, rollingCRC)
    errorCorrectingCode = (errorCorrectingCode & 0xfffffff0) | encryptMethod
    errorCorrectingCode = errorCorrectingCode >>> 0

    const buffer = new Int32Array([errorCorrectingCode]).buffer
    const errorCorrectingCodeBuffer = new Uint8Array(buffer)

    const mergedBuffer = dataview.concat(publicKey, errorCorrectingCodeBuffer)
    // console.log(mergedBuffer)
    const address = {
      currency: 'DIO',
      address: mergedBuffer,
      encryptMethod: 'sm2',
      encryptMethodOrderNumber: encryptMethod,
      salt: salt || 1,
      alias: alias || `Address${salt}`,
    }
    return address
  }

  private keyPaires() {
    let publicKey = ''
    let privateKey = ''

    if (this.privateKey) {
      privateKey = this.privateKey
      publicKey = this.getPubicKeyFromPrivateKey(privateKey)
    } else {
      const { publicKey: pk, privateKey: sk } = sm2.generateKeyPairHex()
      publicKey = pk
      privateKey = sk
    }

    return [publicKey, privateKey]
  }

  sign(content: string, privateKey: Uint8Array) {
    const sk = dataview.u8ToHex(privateKey)
    const signature = sm2.doSignature(content, sk)
    return signature
  }

  verify(msg: string, sigValueHex: string, publicKey: Uint8Array) {
    const pk = dataview.u8ToHex(publicKey)
    return sm2.doVerifySignature(msg, sigValueHex, pk)
  }
}
