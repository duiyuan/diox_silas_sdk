const { Web3, DIOAddress } = require('../lib/commonjs/index.js')
const { fromByteArray } = require('base64-js')
const { dataview } = require('@dioxide-js/misc')

const web3 = new Web3('http://localhost:7600')

const user_0 = {
  sk: 'e6a5622ce30c642e72ff164ca7a3f7509ea79ee2ec297df49684c5fb2b5e9208',
  address: 'DWM1YCVFSA6D3VSRZNE5NQYW420QTP8KRXVBMDDCK8TYQQZVTAMP9P8Y54:SM2',
  sk_b64: '5qViLOMMZC5y/xZMp6P3UJ6nnuLsKX30loTF+ytekgg=',
}

const user_1 = {
  sk: 'f4957aaeb86d36e5a5ef494244493b4e654ec2100c6533f37c92db5edc749e20',
  address: 'K6HVH97ATMNSGJWWE0DNAWMTQ3QC72Y64V691TDWAGWQRYVTVW3E8WV23G:SM2',
  sk_b64: '9JV6rrhtNuWl70lCREk7TmVOwhAMZTPzfJLbXtx0niA=',
}

const result = generateAddress(user_0.sk)

signTxn()
  .then((rsp) => {
    console.log(rsp)
  })
  .catch(console.error)

function generateAddress(privatekey) {
  const sk_u8 = dataview.hexToU8(privatekey)
  const sk_b64 = fromByteArray(sk_u8)

  const { sk, pk, address } = new DIOAddress('sm2', sk_u8).generate()
  return { sk, pk, address, sk_u8 }
}

async function signTxn() {
  return web3.txn.transfer({
    to: user_1.address,
    amount: '10000000000',
    secretKey: result.sk_u8,
  })
}
