const { Web3, NET } = require('../dist/cjs/index.js')
const { nftOwner } = require('./conf.js')

const user = nftOwner

const web3 = new Web3(NET.UAT, {
  apiKey: 'sk_CDdiLOUG31vArLW35incaSkclHVBiB7yNQQ3YbNJh1M',
})
const dapp = 'test'
const name = 'NonfungiblesToken'
const contract1 = ``

async function start() {
  const abi = await web3.contract.abi(dapp + '.' + name)
  console.log('abi =>', abi)

  const invokeHash = await web3.contract.run(user.privatekey, {
    sender: user.address,
    func: `${dapp}.${name}.newCollection`,
    args: {
      name: 'collection-wsw1',
      everyone_mintable: true,
      tradable: true,
      uri: 'http://abc.com',
    },
  })
  console.log('run contract function =>', invokeHash)
  return true
}

start().then(console.log).catch(console.error)
