// https://const.net.cn/tool/sm2/genkey/

const { Web3, DIOAddress } = require('../lib/commonjs/index.js')
const { fromByteArray, toByteArray } = require('base64-js')
const { dataview } = require('@dioxide-js/misc')

const web3 = new Web3('http://localhost:7600')

const user_0 = {
  sk: 'NkX61/SdEIajg+lAcHNEgiFiMsjIkf4wQ+CswpkFODQ=',
  address: '2hh0gc3src6payx9z6wvgkcek0tef9qc8k7j8f312qszyeyp64mn8y9sxr:sm2',
  sk_b64: 'g+N6oQMedYju5L7K8KJpQpjpWExDiM0bpBgbFoXHbUm47jJeTVxs9PIrPmU/ZTI1UeRvvtJlktfhvVzT3S52zQ==',
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
  const { sk, pk, address, sku8, pku8, lpku8 } = await new DIOAddress(alg, privatekey).generate()
  const p = dataview.u8ToBase64(pku8)
  const lpk = dataview.u8ToBase64(lpku8)
  console.log('64b =>', p)
  console.log('65b =>', lpk)
  return { sk, pk, address, sk_u8: sku8 }
}

async function signTxn() {
  const result = await generateAddress('sm2', user_0.sk)

  return web3.txn.transfer({
    to: user_1.address,
    amount: '300000000',
    secretKey: result.sk_u8,
  })
}
