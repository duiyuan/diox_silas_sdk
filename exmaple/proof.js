// https://const.net.cn/tool/sm2/genkey/

const { Web3, DIOAddress } = require('../lib/commonjs/index.js')
const { fromByteArray, toByteArray } = require('base64-js')
const { dataview } = require('@dioxide-js/misc')

const web3 = new Web3('http://localhost:7600')

const user1 = {
  PrivateKey: 'gMAsFkh3C6Q63XAd+MoZC7BUrQTCAi8DAEzHGDXJOqc=',
  PublicKey: '/TbfaenGkDtwrcM6WmCJ2BMzeQ3MXjlBd4IDQ6QEJYDBLuVFh+niU8kocEJEDZQp1Tp7H69VG3W9W2iSZhHPoQ==',
  Address: '795csryp16ep27cwbhqnj510ddkv904n961kat1tm2vswp37xf878by600:sm2',
}

const user2 = {
  PrivateKey: 'QYm4dkdD1zsN/0pui4JUj+c9dJVPFk16ifk8z0m+9og=',
  PublicKey: 'BLJZvVfYw29Xb8qu3FfdaeCR1X3v3hfbX+Dw98TPULSJ4swqFYpTvxrHKOGA2r2w2YqXG4ceL0YSbfR0wBW7Fp8=',
  Address: 'gjt11z0467ydw2a0bbqpbcwbbfp03p8xqvsfqcxfkkk3vf3yw6cj9ym730:sm2',
}

web3.proof
  .newProof({
    sender: user2.Address,
    secretKey: dataview.base64ToU8(user2.PrivateKey),
    key: 'test_sdk',
    content: 'test_sdk',
  })
  .then(console.log)
  .catch(console.error)
