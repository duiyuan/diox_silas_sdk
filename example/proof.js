// https://const.net.cn/tool/sm2/genkey/

const { Web3, NET, utils } = require('../dist/cjs/index.js')
const toProofKeyHash = utils.toProofKeyHash

const web3 = new Web3(NET.LOCAL, {
  apiKey: 'sk_CDdiLOUG31vArLW35incaSkclHVBiB7yNQQ3YbNJh1M',
  n: 0,
})
const proof = web3.proof

const user = {
  publickey: 'O4GTwRNTpbMKsxcWTr9LmADH0FHkanQSWIeFSD4XcGNGHeZFJMB0RcmhqYizk0/zveyS9IL4nXXMTqWYwsbVbw==',
  address: 'wp38ftjf6s8wvvx723z0zhth1ea1ghg6bsc4gj8wp4ncsephbt6e8315w8:sm2',
  timestamp: '1757496019',
  access_token: 'C0ZyYuG5fcUbuFMGZSHLudnYpftBtMw-KLPdYcfM8GuRKsZAfm9ipQ',
  privatekey: 'b8g2w9r2SZ2ZhPXA+93t4akgZUvyrKKO1hvXep2ZaMw=',
}

const user_0 = {
  sk: 'NkX61/SdEIajg+lAcHNEgiFiMsjIkf4wQ+CswpkFODQ=',
  address: '2hh0gc3src6payx9z6wvgkcek0tef9qc8k7j8f312qszyeyp64mn8y9sxr:sm2',
  pk_b64: 'g+N6oQMedYju5L7K8KJpQpjpWExDiM0bpBgbFoXHbUm47jJeTVxs9PIrPmU/ZTI1UeRvvtJlktfhvVzT3S52zQ==',
}

proof
  .newProof(user.privatekey, {
    sender: user.address,
    key: 'test_sdk11',
    content: 'test_sdk11',
  })
  .then(async (tx_hash) => {
    console.log(tx_hash)
  })
  .catch(console.error)

// const fileBuffer = new Uint8Array([0x1, 0x2, 0x3, 0x4])
// const proofKey = toProofKeyHash(fileBuffer)
// proof
//   .newProofByProofKey(user.sk, {
//     sender: user.address,
//     proof_key: proofKey,
//     content: 'ff',
//   })
//   .then(async (tx_hash) => {
//     console.log(tx_hash)
//     await sleep(20000)
//     proof
//       .getProofs({ tx_hash: tx_hash })
//       .then((proofs) => {
//         console.log(proofs)
//         web3.proof.checkProof({ proof_hash: proofs[0].ProofHash }).then(console.log).catch(console.error)
//       })
//       .catch(console.error)
//   })
//   .catch(console.error)

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}
