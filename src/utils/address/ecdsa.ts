import { dataview } from '@dioxide-js/misc'
import * as ed from '@noble/ed25519'
import base32Encode from 'base32-encode'
import sha256 from 'sha256'
import crc32c from 'crc-32/crc32c.js'
import crypto from 'crypto'

import GenericAddress, { encodeMnemonic, EncryptMethod, formatedSalt } from './base'

export interface IaddressDetails {
  currency: string
  address: Uint8Array
  encryptMethod: string
  encryptMethodOrderNumber: number
  salt: number
  alias?: string
}
interface Options {
  privateKey?: Uint8Array
  salt?: Uint8Array
  seed?: Uint8Array
}

export default class ECDSA implements GenericAddress {
  private privateKey?: string
  private privateKeyU8?: Uint8Array = new Uint8Array()

  encryptMethod: EncryptMethod = 'sm2'
  encryptOrderNum = 4

  saltRef = 1
  salt = new Uint8Array()
  seed = new Uint8Array()
  alias = 'Address1'
  words: string[] = []

  constructor(options?: Options) {
    if (options?.privateKey) {
      const { privateKey } = options
      if (!(privateKey instanceof Uint8Array)) {
        throw `Illegal privatekey, expect Uint8Array`
      }

      this.salt = formatedSalt(this.saltRef)
      this.seed = this.generateSeed()

      this.privateKeyU8 = this.get32bPrivateKey(options.privateKey)
      this.privateKey = dataview.u8ToHex(this.privateKeyU8)
    }
  }

  generateSeed(seed?: number[]) {
    let seedU8: number[] | Uint8Array = []
    if (!seed) {
      const tableContainer = new Uint8Array(27)
      const randomData = crypto.getRandomValues(tableContainer)
      seedU8 = randomData // sha256(randomData as Buffer, { asBytes: true })
    } else {
      seedU8 = seed
    }
    this.words = encodeMnemonic(seedU8)
    return new Uint8Array(seedU8)
  }

  async generate() {
    const [pku8, sku8] = await this.keyPaires()

    const o = this.pkToDIOStruct(pku8, this.encryptOrderNum, this.encryptMethod)
    const sk = dataview.u8ToHex(sku8)
    const pk = dataview.u8ToHex(pku8)
    const address = base32Encode(o.address, 'Crockford').toLowerCase() + ':' + this.encryptMethod
    return { pk, sk, pku8, sku8, address }
  }

  getPubicKeyFromPrivateKey(privateKey: string | Uint8Array): Promise<Uint8Array> {
    if (typeof privateKey === 'string') {
      privateKey = dataview.hexToU8(privateKey)
    }
    return ed.getPublicKey(privateKey)
  }

  private pkToDIOStruct(
    publicKey: Uint8Array,

    salt = 1,
    alias?: string,
  ) {
    const order = this.encryptOrderNum
    const method = this.encryptMethod
    let errorCorrectingCode = crc32c.buf(publicKey, order)
    errorCorrectingCode = (errorCorrectingCode & 0xfffffff0) | order
    errorCorrectingCode = errorCorrectingCode >>> 0

    const buffer = new Int32Array([errorCorrectingCode]).buffer
    const errorCorrectingCodeBuffer = new Uint8Array(buffer)

    const mergedBuffer = dataview.concat(publicKey, errorCorrectingCodeBuffer)
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

  private async keyPaires(): Promise<[Uint8Array, Uint8Array]> {
    let publicKey: Uint8Array
    let privateKey: Uint8Array

    if (this.privateKey && this.privateKeyU8) {
      privateKey = this.privateKeyU8
      publicKey = await ed.getPublicKey(privateKey)
    } else {
      const [pk, sk] = await seed2PairOfKey(this.seed, this.salt)
      publicKey = pk
      privateKey = sk
    }

    return [publicKey, privateKey]
  }

  async sign(content: string | Uint8Array | number[], privateKey: Uint8Array) {
    if (Array.isArray(content)) {
      const message = Uint8Array.from(content)
      return ed.sign(message, privateKey)
    }
    privateKey = this.get32bPrivateKey(privateKey)
    return ed.sign(content, privateKey)
  }

  private get32bPrivateKey(sk: Uint8Array) {
    const l = sk.length
    if (!(l === 64 || l === 32)) {
      throw `Illegal PrivateKey format, expect 32 bytes 64 bytes`
    }
    return sk.length === 64 ? sk.slice(0, 32) : sk
  }

  verify(msg: string | Uint8Array | number[], sigValueHex: string, publicKey: Uint8Array) {
    const pk = dataview.u8ToHex(publicKey)
    if (Array.isArray(msg)) {
      msg = Uint8Array.from(msg)
      msg = dataview.u8ToHex(msg)
    }
    return ed.verify(sigValueHex, msg, pk)
  }
}

async function seed2PairOfKey(
  seed: Uint8Array,
  salt: Uint8Array = new Uint8Array(),
): Promise<[Uint8Array, Uint8Array]> {
  const formatedSeed = dataview.concat(seed, salt)
  const privateKeyStr = sha256(formatedSeed as Buffer, { asBytes: true })
  const privateKey = new Uint8Array(privateKeyStr)
  const publicKey = await ed.getPublicKey(privateKey)

  return [publicKey, privateKey]
}

export function encodeAddressBuffer(address: Uint8Array): string {
  return base32Encode(address, 'Crockford').toLocaleLowerCase()
}
