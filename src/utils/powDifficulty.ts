import { sha256 } from 'js-sha256'
import { sha512 } from 'js-sha512'

interface IPowDifficulty {
  originTxn: ArrayBuffer
  hashSize?: number
  ttl?: number
  n?: number
}
class PowDifficulty {
  hashSize: number
  targetNum: bigint
  nonZeroBytes: number
  originTxn: ArrayBuffer
  powData: ArrayBuffer
  ttl: number
  n: number

  constructor({ originTxn, hashSize, ttl, n }: IPowDifficulty) {
    this.hashSize = hashSize || 32
    this.targetNum = BigInt(0)
    this.nonZeroBytes = 0
    this.originTxn = originTxn
    this.ttl = ttl || 120
    this.powData = sha512.arrayBuffer(this.originTxn)
    this.n = n ?? 3
  }

  get nonceLen() {
    return 4 * this.n
  }

  public LeadingZeroBits(x: bigint) {
    let binaryString = x.toString(2)
    let number = 0
    while (binaryString.length < 64) {
      binaryString = '0' + binaryString
      number++
    }

    return number
  }

  Set(denominator: number) {
    let num = BigInt('0x8000000000000000') / BigInt(denominator.toFixed(0))
    const shift = this.LeadingZeroBits(num)
    num = BigInt(num) << BigInt(shift)
    const exp = this.hashSize * 8 - 63 - shift
    const bytes = Math.floor(exp / 8)
    const residue = exp % 8

    if (residue) {
      this.nonZeroBytes = bytes + 1
      num >>= BigInt(8) - BigInt(residue)
    } else {
      this.nonZeroBytes = bytes
    }
    this.targetNum = num >> BigInt(32)
    this.nonZeroBytes += 8
    console.log({ denominator, targetNum: this.targetNum, nonZeroBytes: this.nonZeroBytes })
  }

  IsFulfilled(sha256Buffer: ArrayBuffer) {
    const end = this.hashSize
    const start = this.nonZeroBytes

    if (this.targetNum <= new DataView(sha256Buffer).getUint32(start - 4, true)) {
      return false
    }

    for (let i = start; i < end; i++) {
      // console.log(i, sha256Buffer, new DataView(sha256Buffer), 'get nonce')
      const target = new DataView(sha256Buffer).getInt8(i)
      // console.log(target, 'target')
      if (target !== 0) {
        return false
      }
    }
    return true
  }

  getNonce() {
    // set diffculty
    // this.Set((1000 + (this.originTxn.byteLength + NONCE_LEN) * (this.ttl * 10 + 100)) / 3)
    // this.Set((1 + (this.originTxn.byteLength + this.nonceLen) * (this.ttl * 10 + 100)) / this.n)
    this.Set((1000 + (this.originTxn.byteLength + this.nonceLen) * (this.ttl * 10 + 100)) / this.n)
    // loop nonce
    const nonces: number[] = []
    let nonce = 0
    let start = Date.now()
    for (let i = 0; i < this.n; i++) {
      while (true) {
        const cloneData = new DataView(this.powData)
        // 64[origin] - 4[nonce]
        cloneData.setUint32(60, nonce, true)
        const powDataWithNonce = sha256.arrayBuffer(cloneData.buffer)
        if (this.IsFulfilled(powDataWithNonce)) {
          nonces[i] = nonce
          const end = Date.now()
          console.log(`computed nonce(${i}) =>`, nonce, end - start + 'ms')
          start = Date.now()
          break
        }
        nonce++
      }
      nonce++
    }
    return nonces
  }

  getHashMixinNonnce() {
    const finalBytes = new Uint8Array(this.originTxn.byteLength + this.nonceLen)
    finalBytes.set(new Uint8Array(this.originTxn), 0)
    // add nonce to last
    if (this.n > 0) {
      const nonces = this.getNonce()
      nonces.forEach((nonce, i) => {
        finalBytes.set(new Uint8Array(new Uint32Array([nonce]).buffer), this.originTxn.byteLength + i * 4)
      })
    }
    return finalBytes.buffer
  }
}

export default PowDifficulty
