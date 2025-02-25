import base32Decode from 'base32-decode'

/**
 * address to shard
 * @param address
 * @param shardOrder
 * @returns shard
 */
export const addressToShard = (address: string, shardOrder = 2): number => {
  const addressStr = address.split(':')[0]
  if (!addressStr) {
    throw new Error('Invalid address format')
  }
  const unit8Array = new Uint8Array(base32Decode(addressStr, 'Crockford'))
  const decoded = String.fromCharCode.apply(null, [...unit8Array])
  if (!decoded || decoded.length != 36) throw 'invalid address format'
  const dwords = new Uint32Array(9)
  for (let i = 0; i < 9; i++) {
    dwords[i] = 0
    for (let j = 0; j < 4; j++) {
      dwords[i] += decoded.charCodeAt(i * 4 + j) << (j * 8)
    }
  }
  const shardDword = dwords[0] ^ dwords[7] ^ dwords[4]
  const shardMask = ~(0xffffffff << shardOrder)
  return shardDword & shardMask
}
