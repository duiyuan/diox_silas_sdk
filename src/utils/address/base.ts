import dictionary from '../dictionary'

export interface AddressGenerated {
  pk: string
  sk: string
  pku8: Uint8Array
  sku8: Uint8Array
  address: string
}

export type Hex = string

export default abstract class GenericAddress {
  abstract getPubicKeyFromPrivateKey(privateKeyHex: string | Uint8Array): Promise<Uint8Array>
  abstract generate(): Promise<AddressGenerated>
  abstract sign(content: string | number[] | Uint8Array, privateKey: Uint8Array): Promise<Uint8Array>
  abstract verify(msg: string | number[] | Uint8Array, signedValHex: Hex, publicKey: Uint8Array): Promise<boolean>
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
