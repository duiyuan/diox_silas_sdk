// https://const.net.cn/tool/sm2/genkey/

const { Web3, DIOAddress } = require('../lib/commonjs/index.js')
const { fromByteArray, toByteArray } = require('base64-js')
const { dataview } = require('@dioxide-js/misc')

const web3 = new Web3('http://localhost:7600')

const user_0 = {
  sk: 'e6a5622ce30c642e72ff164ca7a3f7509ea79ee2ec297df49684c5fb2b5e9208',
  address: 'cctpwtsk12w2n2y3jwysfptq1y1az8dkm337w4rvv6sad2zayzqn8y3x4w:sm2',
  sk_b64: '5qViLOMMZC5y/xZMp6P3UJ6nnuLsKX30loTF+ytekgg=',
}

const user_1 = {
  sk: 'f4957aaeb86d36e5a5ef494244493b4e654ec2100c6533f37c92db5edc749e20',
  address: 'k3sep2ac0e6bhz47drcs80a5fcmb13pkbf8jnvtqdy8hzycehd2k8mjjyw:sm2',
  sk_b64: '9JV6rrhtNuWl70lCREk7TmVOwhAMZTPzfJLbXtx0niA=',
}

signTxn()
  .then((rsp) => {
    console.log(rsp)
  })
  .catch(console.error)

async function generateAddress(alg, privatekey) {
  const sk_u8 = dataview.hexToU8(privatekey)

  const { sk, pk, address, sku8 } = await new DIOAddress(alg, sk_u8).generate()
  return { sk, pk, address, sk_u8: sku8 }
}

async function signECDSATxn() {
  const result = await generateAddress('ecdsa', user_0.sk)

  return web3.txn.transfer({
    to: user_1.address,
    amount: '10000000000',
    secretKey: result.sk_u8,
  })
}

async function signTxn() {
  const result = await generateAddress('sm2', user_0.sk)

  return web3.txn.transfer({
    to: user_1.address,
    amount: '300000000',
    secretKey: result.sk_u8,
  })
}

async function signEd25519Txn() {
  // const sk = 'L5BqNz9qv7i1ycQVsIFr7w9GjS1yRNyQhn931rLNaC1ns9etY5xZ6h05E7jTFHo8wZT7f0kv676hMMwo6qinHQ=='
  // const u8 = toByteArray(sk)
  // const skhex = dataview.u8ToHex(u8)
  // const user = {
  //   skhex: skhex,
  //   address: 'cysxfbb3khcym79s2ewd653t7k0s9yvz94qyqfn16362htn8mwem7q8n6w:ed25519',
  // }
  const result = await generateAddress('ed25519', user_0.sk)

  return web3.txn.transfer({
    to: 'm00ad46hnbt27hg05vfdpahp1jp8gyfp3vytst9yxhewfv4ws5x4669dr8:ed25519',
    amount: '10000000000',
    secretKey: result.sk_u8,
  })
}
