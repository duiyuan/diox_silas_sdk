import * as ed from '@noble/ed25519'
import base32Encode from 'base32-encode'
import sha256 from 'sha256'
import crc32c from 'crc-32/crc32c.js'
import crypto from 'crypto'
import dictionary from './dictionary'

import { concat } from './buffer'
import { addressToShard } from './getAddressShardIndex'

export interface IaddressDetails {
  currency: string
  address: Uint8Array
  encryptMethod: string
  encryptMethodOrderNumber: number
  salt: number
  alias?: string
}

class Address {
  saltRef = 1
  salt: Uint8Array
  alias = 'Address1'
  seed: Uint8Array
  words: string[] = []
  constructor() {
    this.salt = this.formatedSalt(this.saltRef)
    this.seed = this.generateSeed()
  }

  async generateAddress() {
    const keyPair = await seed2PairOfKey(this.seed, this.salt)
    if (!keyPair) throw new Error('Invalid key received')

    const address = pk2Address(keyPair[0])
    if (!address) throw new Error('Failed to generate')

    // address.concatedSK = encode(this.concat(keyPair[1], keyPair[0]))
    // console.log(address)
    return {
      address: base32Encode(address.address, 'Crockford').toLocaleLowerCase() + ':' + address.encryptMethod,
      words: this.words,
      seed: this.seed,
    }
  }

  generateSeed(seed?: number[]) {
    try {
      let seedU8: number[] | Uint8Array = []
      if (!seed) {
        const tableContainer = new Uint8Array(27)
        const randomData = crypto.getRandomValues(tableContainer)
        seedU8 = randomData // sha256(randomData as Buffer, { asBytes: true })
      } else {
        seedU8 = seed
      }
      this.words = this.encodeMnemonic(seedU8)
      return new Uint8Array(seedU8)
    } catch (error) {
      console.error('Exception ' + error)
    }
    return new Uint8Array()
  }

  encodeMnemonic(seed: number[] | Uint8Array) {
    try {
      const ret = []
      for (let i = 0; i < 9; i++) {
        const x = seed[i * 3] + (seed[i * 3 + 1] % 16) * 256
        const y = (seed[i * 3 + 1] >> 4) + seed[i * 3 + 2] * 16
        ret.push(dictionary[x])
        ret.push(dictionary[y])
      }
      return ret
    } catch (e) {
      return []
    }
  }

  formatedSalt(salt: number) {
    if (salt == 1) {
      return new Uint8Array()
    } else {
      const ret = new Uint8Array(5)
      ret[0] = 0
      ret[1] = (salt - 1) % 256
      ret[2] = ((salt - 1) >> 8) % 256
      ret[3] = ((salt - 1) >> 16) % 256
      ret[4] = (salt - 1) >> 24
      return ret
    }
  }
}

export async function generateAddress(shardIndex?: number) {
  const addressInstance = new Address()
  const { address, seed } = await addressInstance.generateAddress()
  if (shardIndex !== undefined) {
    const targetShardIndex = addressToShard(address)
    if (targetShardIndex !== shardIndex) {
      return generateAddress(shardIndex)
    }
  }
  return {
    address,
    seed,
  }
}

export function pk2Address(
  publicKey: Uint8Array,
  rollingCRC: number = 3,
  encryptMethod: number = 0x3,
  salt: number = 1,
  alias?: string,
): IaddressDetails {
  let errorCorrectingCode = crc32c.buf(publicKey, rollingCRC)
  errorCorrectingCode = (errorCorrectingCode & 0xfffffff0) | encryptMethod
  errorCorrectingCode = errorCorrectingCode >>> 0

  const buffer = new Int32Array([errorCorrectingCode]).buffer
  const errorCorrectingCodeBuffer = new Uint8Array(buffer)

  const mergedBuffer = concat(publicKey, errorCorrectingCodeBuffer)
  // console.log(mergedBuffer)
  const address = {
    currency: 'DIO',
    address: mergedBuffer,
    encryptMethod: 'ed25519',
    encryptMethodOrderNumber: encryptMethod,
    salt: salt || 1,
    alias: alias || `Address${salt}`,
  }
  return address
}

export async function seed2PairOfKey(seed: Uint8Array, salt: Uint8Array = new Uint8Array()) {
  if (!seed) throw new Error('Invalid seed')
  const formatedSeed = concat(seed, salt)
  const privateKeyStr = sha256(formatedSeed as Buffer, { asBytes: true })
  const privateKey = new Uint8Array(privateKeyStr)
  const publicKey = await ed.getPublicKey(privateKey)

  if (!privateKey || !publicKey) {
    return undefined
  }

  return [publicKey, privateKey]
}

export function encodeAddressBuffer(address: Uint8Array): string {
  return base32Encode(address, 'Crockford').toLocaleLowerCase()
}
