export interface AddressGenerated {
  pk: string
  sk: string
  pku8: Uint8Array
  sku8: Uint8Array
  address: string
}

type hex = string

export default abstract class GenericAddress {
  abstract getPubicKeyFromPrivateKey(privateKeyHex: string | Uint8Array): Uint8Array
  abstract generate(): Promise<AddressGenerated> | AddressGenerated
  abstract sign(content: string | number[] | Uint8Array, privateKey: Uint8Array): Promise<string> | string
  abstract verify(
    msg: string | number[] | Uint8Array,
    signedValHex: hex,
    publicKey: Uint8Array,
  ): Promise<boolean> | boolean
}
