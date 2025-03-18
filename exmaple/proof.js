// https://const.net.cn/tool/sm2/genkey/

const { Web3, NET } = require('../lib/commonjs/index.js')

const web3 = new Web3(NET.LOCAL)

const user = {
  PrivateKey: 'emWeGPBrrail1xFqMhc5Omk6APyU4Wou/T8zBaBwEKM=',
  PublicKey: 'u22RPIe1BNWo6ckxFj+UEpg4/15/jOsrJijmkq1+ey20yWeVKac60CDnqQ8jmu8qu7RQYMpHM4vVHo4BSuc0Ow==',
  Address: 's62t06e3kp9192spw39djj231v9ftbh5wvvs3akyc6ytxrv02zr89d5d5w:sm2',
}

const user_0 = {
  sk: 'NkX61/SdEIajg+lAcHNEgiFiMsjIkf4wQ+CswpkFODQ=',
  address: '2hh0gc3src6payx9z6wvgkcek0tef9qc8k7j8f312qszyeyp64mn8y9sxr:sm2',
  sk_b64: 'g+N6oQMedYju5L7K8KJpQpjpWExDiM0bpBgbFoXHbUm47jJeTVxs9PIrPmU/ZTI1UeRvvtJlktfhvVzT3S52zQ==',
}

web3.proof
  .newProof(user_0.sk, {
    sender: user_0.address,
    key: 'test_sdk11',
    content: 'test_sdk11',
  })
  .then(async (tx_hash) => {
    console.log(tx_hash)
    await sleep(20000)
    web3.proof
      .getProofs({ tx_hash: tx_hash })
      .then((proofs) => {
        console.log(proofs)
        web3.proof.checkProof({ proof_hash: proofs[0].ProofHash }).then(console.log).catch(console.error)
      })
      .catch(console.error)
  })
  .catch(console.error)

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}
