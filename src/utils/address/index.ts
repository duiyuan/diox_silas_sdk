import GenericAddress from './interface'
import DIOSM2 from './sm2'

type Alg = 'sm2' | 'ed25519'

export class DIOAddress {
  alg: Alg = 'sm2'

  privateKey: Uint8Array | null = null

  instance: GenericAddress | null = null

  constructor(alg: Alg, privateKey?: Uint8Array) {
    this.alg = alg

    if (privateKey) {
      this.privateKey = privateKey
    }

    switch (alg) {
      case 'sm2':
        this.instance = new DIOSM2({ privateKey: privateKey })
        break
      case 'ed25519':
      default:
        throw 'DIOAddress ERROR: unsupported alg:' + this.alg
    }
  }

  generate() {
    return this.instance!.generate()
  }

  sign(content: string, privateKey: Uint8Array) {
    return this.instance!.sign(content, privateKey)
  }

  verifySignature(msg: string, sigValueHex: string, publicKey: Uint8Array) {
    return this.instance?.verify(msg, sigValueHex, publicKey)
  }
}
