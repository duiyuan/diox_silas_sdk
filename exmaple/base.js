const { Web3 } = require('../lib/commonjs/index.js')

const web3 = new Web3('http://localhost:7600')
const user1 = 'cysxfbb3khcym79s2ewd653t7k0s9yvz94qyqfn16362htn8mwem7q8n6w:ed25519'
const addr = 'core:dapp'
const txnHash = 'zc2szptjcygmw2x0t1w066j5h7gfg71h2kdjwaf619khe2cdmhtg'

web3.address.getISN(user1).then(console.log)

web3.address.getTxnListByAddress({ address: user1 }).then(console.log).catch(console.error)

web3.address
  .getAddressState({ address: 'BRX:token', contract: 'core.profile.address' })
  .then(console.log)
  .catch(console.error)

web3.address.getAddressInfo(addr).then(console.log).catch(console.error)
web3.address.getBalance(user1).then(console.log).catch(console.error)

web3.overview.chainStatus().then(console.log).catch(console.error)
web3.txn.getTxn(txnHash).then(console.log).catch(console.error)
web3.blocks.getExcutedTx({ height: 30 }).then(console.log).catch(console.error)
