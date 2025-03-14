// https://const.net.cn/tool/sm2/genkey/

const { Web3, DIOAddress } = require('../lib/commonjs/index.js')
const { fromByteArray, toByteArray } = require('base64-js')
const { dataview } = require('@dioxide-js/misc')

const web3 = new Web3('http://localhost:7600')

const user = {
  PrivateKey: 'emWeGPBrrail1xFqMhc5Omk6APyU4Wou/T8zBaBwEKM=',
  PublicKey: 'u22RPIe1BNWo6ckxFj+UEpg4/15/jOsrJijmkq1+ey20yWeVKac60CDnqQ8jmu8qu7RQYMpHM4vVHo4BSuc0Ow==',
  Address: 's62t06e3kp9192spw39djj231v9ftbh5wvvs3akyc6ytxrv02zr89d5d5w:sm2',
}

web3.proof
  .newProof({
    sender: user.Address,
    secretKey: dataview.base64ToU8(user.PrivateKey),
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

web3.proof.getProofs({ owner: user.Address }).then(console.log).catch(console.error)
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}
