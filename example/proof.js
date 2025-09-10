// https://const.net.cn/tool/sm2/genkey/

const { Web3, NET, utils } = require('../dist/cjs/index.js')
const { user } = require('./conf')

const web3 = new Web3(NET.LOCAL, {
  apiKey: 'sk_CDdiLOUG31vArLW35incaSkclHVBiB7yNQQ3YbNJh1M',
})
const proof = web3.proof

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
