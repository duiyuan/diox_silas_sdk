# @dioxide-js/silas

@dioxide-js/silas is a Nodejs SDK implementation of the [Silas RPC API](#)

## Installation

### Using NPM

```bash
npm install @dioxide-js/silas
```

### Using Yarn

```bash
yarn add @dioxide-js/silas
```

## Getting Started

```js
import { Web3, NET } from '@dioxide-js/silas'
import { dataview } from '@dioxide-js/misc'

const web3 = new Web3(NET.TEST) // const web3 = new Web3(NET.MAIN); // For production
const registedUser0 = {
  privatekey: '2TDvtnWYrwFCu0fgIG2oXEIXhZ1LH7nMpVOdHJO3hL4=',
  address: '919vj07v99y1g0k05rrxfawn47m4scjzsjtarvnx4z23j164ffjr98hqdc:sm2',
}

// Transfer dio
const txnHash = await web3.txn.transfer({
  to: 'ew0wj1ew8ct8tvsgqj8ch4gwmea0506wp8pq68nd5v54wgqa9csj9f6hxm:sm2',
  amount: '10000000000',
  secretKey: dataview.base64ToU8(registedUser0.privatekey),
})
```
