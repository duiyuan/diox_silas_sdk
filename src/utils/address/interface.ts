export interface AddressGenerated {
  pk: string
  sk: string
  pku8: Uint8Array
  sku8: Uint8Array
  address: string
}

type hex = string

export default abstract class GenericAddress {
  abstract generate(): Promise<AddressGenerated> | AddressGenerated
  abstract sign(content: string, privateKey: Uint8Array): Promise<string> | string
  abstract verify(msg: string, signedValHex: hex, publicKey: Uint8Array): Promise<boolean> | boolean
}
