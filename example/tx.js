// https://const.net.cn/tool/sm2/genkey/

const { Web3, DIOAddress, NET } = require('../dist/cjs/index.js')
const { dataview } = require('@dioxide-js/misc')

const web3 = new Web3(NET.LOCAL, {
  showTxFlow: true,
  apiKey: 'abcdef',
  n: 3,
})

const user_0 = {
  sk: 'NkX61/SdEIajg+lAcHNEgiFiMsjIkf4wQ+CswpkFODQ=',
  address: '2hh0gc3src6payx9z6wvgkcek0tef9qc8k7j8f312qszyeyp64mn8y9sxr:sm2',
  pk_b64: 'g+N6oQMedYju5L7K8KJpQpjpWExDiM0bpBgbFoXHbUm47jJeTVxs9PIrPmU/ZTI1UeRvvtJlktfhvVzT3S52zQ==',
  pk_b16:
    '83e37aa1031e7588eee4becaf0a2694298e9584c4388cd1ba4181b1685c76d49b8ee325e4d5c6cf4f22b3e653f65323551e46fbed26592d7e1bd5cd3dd2e76cd',
}

const user_1 = {
  sk: 'f4957aaeb86d36e5a5ef494244493b4e654ec2100c6533f37c92db5edc749e20',
  address: 'k3sep2ac0e6bhz47drcs80a5fcmb13pkbf8jnvtqdy8hzycehd2k8mjjyw:sm2',
  sk_b64: '9JV6rrhtNuWl70lCREk7TmVOwhAMZTPzfJLbXtx0niA=',
}

async function verifyGivenSignature() {
  const signature =
    'fe63c42468e983d27e8ee3841a2c1cfeec916250949ec8fca2ceb59ab759f1514c9caa27e4893c3a91b9cfe0d61cc66a71aa6310d56f37b9e18057bf9c25c33a'
  const message = 'hahahaa12323'
  const msg = dataview.stringToU8(message)

  const publicKey = dataview.concat(new Uint8Array([0x4]), dataview.hexToU8(user_0.pk_b16))
  const dioAddress = new DIOAddress('sm2', dataview.base64ToU8(user_0.sk))
  const result = await dioAddress.verifySignature(msg, signature, publicKey, {
    der: false,
    hash: false,
  })
  return result
}

async function generateAddress(alg, privatekey) {
  const { privatekey: sk, publickey: pk, address, sku8, pku8, lpku8 } = await new DIOAddress(alg, privatekey).generate()
  const p = dataview.u8ToBase64(pku8)
  const lpk = dataview.u8ToBase64(lpku8)
  const ret = { sk, pk, address, sk_u8: sku8 }
  console.log(ret)
  return ret
}

async function signTxn() {
  const result = await generateAddress('sm2', user_0.sk)
  return web3.txn.transfer({
    sender: user_0.address,
    to: user_1.address,
    amount: '30000',
    secretKey: result.sk_u8,
  })
}

async function start() {
  const result = await verifyGivenSignature()
  console.log('verfiy =>', result)

  const signed = await signTxn()
  console.log('signed result =>', signed)
}

start().catch(console.error)
// generateAddress('sm2', '0heUr38QG+xZria1wOZxZ8tyzYDyjFWXBp2gI+EnupE=').catch(console.error)
