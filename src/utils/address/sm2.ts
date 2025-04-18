import * as smcrypto from 'sm-crypto'
import { dataview } from '@dioxide-js/misc'
import crc32c from 'crc-32/crc32c.js'
import base32Encode from 'base32-encode'

import GenericAddress, { EncryptMethod, AlgOption } from './base'
import { toUint8Array } from '../buffer'

const sm2 = smcrypto.sm2
const sm3 = (smcrypto as any).default.sm3

interface Options {
  privateKey?: Uint8Array
}

export default class DIOSM2 implements GenericAddress {
  private privateKey?: string

  encryptMethod: EncryptMethod = 'sm2'
  encryptOrderNum = 4

  constructor(options?: Options) {
    if (options?.privateKey) {
      const { privateKey } = options
      const sk = toUint8Array(privateKey)
      this.privateKey = dataview.u8ToHex(sk)
    }
  }

  async generate() {
    const [pk, sk] = await this.keyPaires()
    const publickKeyU8 = dataview.hexToU8(pk!)
    const sku8 = dataview.hexToU8(sk!)

    const pku8 = publickKeyU8.length === 65 ? publickKeyU8.slice(1) : publickKeyU8
    const lpk8 = publickKeyU8.length === 65 ? publickKeyU8 : dataview.concat(new Uint8Array([4]), publickKeyU8)
    const address = this.pkToAddress(pku8, true)
    const ret = { publickey: pk, privatekey: sk, pku8, sku8, address, lpku8: lpk8 }
    return Promise.resolve(ret)
  }

  hash(publicKey: Uint8Array): Uint8Array {
    const pkHash = sm3(publicKey)
    return dataview.hexToU8(pkHash)
  }

  getPubicKeyFromPrivateKey(privateKeyHex: string | Uint8Array) {
    if (privateKeyHex instanceof Uint8Array) {
      privateKeyHex = dataview.u8ToHex(privateKeyHex)
    }
    const publicKey = (sm2 as any).getPublicKeyFromPrivateKey(privateKeyHex)
    const publickKeyU8 = dataview.hexToU8(publicKey)
    const pku8 = publickKeyU8[0] === 4 ? publickKeyU8.slice(1) : publickKeyU8
    return Promise.resolve(pku8)
  }

  pkToAddress(publickey: Uint8Array, withPosfix = true) {
    const u8 = this.pkToAddrU8(publickey)
    const address = base32Encode(u8, 'Crockford') + (withPosfix ? ':sm2' : '')
    return address.toLowerCase()
  }

  pkToAddrU8(publickey: Uint8Array) {
    if (publickey.length !== 64) {
      throw 'expect 64 bytes public key'
    }
    const pk32b = this.hash(publickey)
    const o = this.pkToDIOStruct(pk32b)
    return o.address
  }

  private pkToDIOStruct(publicKey: Uint8Array, salt = 1, alias?: string) {
    const order = this.encryptOrderNum
    const method = this.encryptMethod
    let errorCorrectingCode = crc32c.buf(publicKey, order)
    errorCorrectingCode = (errorCorrectingCode & 0xfffffff0) | order
    errorCorrectingCode = errorCorrectingCode >>> 0

    const buffer = new Int32Array([errorCorrectingCode]).buffer
    const errorCorrectingCodeBuffer = new Uint8Array(buffer)

    const mergedBuffer = dataview.concat(publicKey, errorCorrectingCodeBuffer)
    // console.log(mergedBuffer)
    const address = {
      currency: 'DIO',
      address: mergedBuffer,
      encryptMethod: method,
      encryptMethodOrderNumber: order,
      salt: salt || 1,
      alias: alias || `Address${salt}`,
    }
    return address
  }

  private async keyPaires() {
    let publicKey = ''
    let privateKey = ''

    if (this.privateKey) {
      privateKey = this.privateKey
      const pk = await this.getPubicKeyFromPrivateKey(privateKey)
      publicKey = dataview.u8ToHex(pk)
    } else {
      const { publicKey: pk, privateKey: sk } = sm2.generateKeyPairHex()
      publicKey = pk
      privateKey = sk
    }

    return [publicKey, privateKey]
  }

  sign(content: string | Uint8Array | number[], privateKey: Uint8Array, options?: AlgOption): Promise<Uint8Array> {
    const sk = dataview.u8ToHex(privateKey)
    if (content instanceof Uint8Array) {
      content = Array.from(content)
    }
    const hash = options?.hash ?? false
    const der = options?.der ?? false
    const signature = sm2.doSignature(content, sk, { hash, der })

    const ret = dataview.hexToU8(signature)
    return Promise.resolve(ret)
  }

  verify(
    msg: string | Uint8Array | number[],
    sigValueHex: string,
    publicKey: Uint8Array,
    options?: AlgOption,
  ): Promise<boolean> {
    const pk = dataview.u8ToHex(publicKey)
    if (msg instanceof Uint8Array) {
      msg = Array.from(msg)
    }
    const hash = options?.hash ?? false
    const der = options?.der ?? false
    const ret = sm2.doVerifySignature(msg, sigValueHex, pk, { hash, der })
    return Promise.resolve(ret)
  }
}
