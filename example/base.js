const { Web3, NET } = require('../dist/cjs/index.js')

const web3 = new Web3(NET.Test)
const user1 = 'dwm1ycvfsa6d3vsrzne5nqyw420qtp8krxvbmddck8tyqqzvtamp9p8y54:sm2'

async function Start() {
  const status = await web3.overview.chainStatus()
  console.log(`chain status =>`, status)

  // Get ISN
  const isn = await web3.address.getISN(user1)
  console.log(`isn =>`, isn)

  const blockList = await web3.block.getHistory({ shardindex: 1 })
  console.log(`blockList =>`, blockList)

  // Get tranasctions by user address
  const txnList = await web3.address.getTxnListByAddress({ address: user1 })
  console.log(`txnList =>`, txnList)

  const recentlyTx = await web3.overview.getTxHistory({ limit: 1 })
  console.log(`recentlyTxList =>`, recentlyTx)

  const list = recentlyTx.ListData[0]
  const tx = await web3.txn.getTx(list.TxnHash)
  console.log(`tx detail =>`, tx.Content)
}

Start().catch((ex) => {
  console.log('error: ', ex)
})
