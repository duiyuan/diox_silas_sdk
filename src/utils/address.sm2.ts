import { SM2 } from 'gm-crypto'

export function GenerateSM2Address() {
  const { publicKey, privateKey } = SM2.generateKeyPair()
  return [publicKey, privateKey]
}
