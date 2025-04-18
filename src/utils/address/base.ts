import { AddressGenerated } from '../../api/type'
import dictionary from '../dictionary'

export type Hex = string
export type EncryptMethod = 'ed25519' | 'sm2' | 'ecdsa'

export interface AlgOption {
  der?: boolean | undefined
  hash?: boolean | undefined
}

export default abstract class GenericAddress {
  abstract encryptMethod: EncryptMethod
  abstract encryptOrderNum: number
  abstract getPubicKeyFromPrivateKey(privateKeyHex: string | Uint8Array): Promise<Uint8Array>
  abstract generate(): Promise<AddressGenerated>
  abstract pkToAddress(publickey: Uint8Array, withPosfix: boolean): string
  abstract pkToAddrU8(publickey: Uint8Array): Uint8Array
  abstract sign(
    content: string | number[] | Uint8Array,
    privateKey: Uint8Array,
    options?: AlgOption,
  ): Promise<Uint8Array>
  abstract verify(
    msg: string | number[] | Uint8Array,
    signedValHex: Hex,
    publicKey: Uint8Array,
    options?: AlgOption,
  ): Promise<boolean>
}

export function encodeMnemonic(seed: number[] | Uint8Array) {
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

export function formatedSalt(salt: number) {
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
