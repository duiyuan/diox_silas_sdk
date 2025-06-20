# @dioxide-js/silas

@dioxide-js/silas is a Nodejs/javascript SDK which designed to interact with [Dioxide JSON RPC API](#)。

## Installation

### For use in Node.js or a web application

using npm

```bash
$ npm install @dioxide-js/silas
```

using yarn

```bash
$ yarn add @dioxide-js/silas
```

Using pnpm:

```bash
$ pnpm add @dioxide-js/silas
```

Using in browser

```
<script src="https://unpkg.com/@dioxide-js/silas@latest/dist/umd/index.min.js"></script>
<script>
    const { Web3 } = DSSWeb3;
    const web3 = new Web3(<DIOSERVICE_ENDPOINT>, {
      apiKey: <YOUR_API_KEY>
    });
    web3.overview.chainStatus().then(console.log)
</script>
```

## Getting Started

### Initialize

```js
import { Web3, NET } from '@dioxide-js/silas'
import { dataview } from '@dioxide-js/misc'

const web3 = new Web3(<DIOSERVICE_ENDPOINT>, {
  apiKey: 'YOUR_API_KEY',
}) // const web3 = new Web3(NET.MAIN); // For production
const user0 = {
  address: 'jjkw5p9fz7nk0zfy6171ch0dy8bk16mhgpwkdcrc4rpt4sfzpvht9za2qr:sm2',
  privatekey: 'AyyogAYL5nVC5CsrTxdYe9IBXOppNqsGd+hSHn+QT68=',
  id: 'stest01',
}

const privatekeyU8 = dataview.base64ToU8(user0.privatekey)
```

### Proofs

##### newProof(privatekey: string | Unit8Array, p: NewProofParams): Promise\<string\>

To set a proof and retrieve tx hash as result.

```
const txnHash = await web3.proof.newProof(user0.privatekey, {
  content: 'sdk unit test',
  key: 'test234',
  sender: user0.address,
})
```

##### getProofs(p: GetProofsParams): Promise\<Proof\>

```
const proofs = await web3.proof.getProofs({
  owner: user0.address,
})
```

##### checkProof(proofHash: string): Promise\<boolean\>

```
const proofs = await web3.proof.checkProof("ctz5ftg90cxm65j3ns5g4f99zezen9a73dkw2s7xspjbg19t4ax0")
```

#### Account

##### generate(alg: Alg = 'sm2', privatekey?: Uint8Array | string): Promise\<AddressGenerated\>

```
const result = await web3.account.generate('sm2')
console.log(result.publickey, result.privatekey, result.address)
```

##### getState(p: RegsiterOption): Promise\<{address: string; publickey: string; status: number; userid: string}>

```javascript
const userState = await web3.account.getState({
  address: user0.address,
})
console.log(userState)

/* output: {
        "address": "a0r0ywzbgntvppvbqwrc6fgfz54f5zq1fme9579bd69j64gvk7f78nmwjm:sm2",
        "publickey": "S7dFGoY5TMydWP1+VuSG5+IpmVMv1jbbqwpBJDxIILtUlntfmrONqfPYZ+0GSbHZ4QlSQaUTcqKrPHWV2nqZTQ==",
        "status": "0",
        "userid": "new_test"
} */
```

##### register(p: RegsiterOption): Promise\<boolean>

```
const registed = await web3.account.register({id: user0.id})
```

### Overview

##### chainStatus(): Promise\<DIOX.ChainStatus>

```
const status = await web3.overview.chainStatus()
console.log(status.Throughput) // output: 100.03
```

##### getTxHistory(params?: DIOXScanReq.History): Promise\<TxSumList>

Get recently transactions on blockchain.

```
const list = await web3.overview.getTxHistory()
console.log(list)
```

### Address

##### getISN(address: string): Promise\<number>

```
const isn = await web3.address.getISN()
console.log(isn) // output: 8
```

##### getTxnListByAddress(params?: ListParmas): Promise\<TxSumList>

Get the list of transactions related to the address (summary information).

```
const list = await web3.address.getTxnListByAddress({
  address: user0.address
})
```

##### getAddressState(data: { address: string; contract: string }): Promise\<AddrBaseInfo>

```
const state = await web3.address.getAddressState({address: user0.address})
console.log(state)
```

##### getAddressInfo(address: string): Promise\<DIOX.Address>

```
const profile = await web3.address.getAddressInfo({
  address: user0.address
})
console.log(profile)
```

### Block

##### getHistory(params: { height: number; limit?: number, pos?: number; shardindex?: number}): Promise<DIOX.Block[] | undefined

```
const blockList = await web3.block.getHistory({"shardindex": 1})
console.log(blockList)
```

##### getExcutedTx(params: { height: number; limit?: number; pos?: number; shardindex?: number }): Promise\<DIOX.ExcutedTx | undefined>

```
const tx = await web3.block.getExcutedTx({"height": 100})
console.log(tx)
```

##### detail(hash: string): Promise\<DIOX.Block>

```
const detail = await web3.block.detail("mgthswczq1b3ycyvh5t3be01t4trayx4k7s7c09ad1natffhk0w0")
console.log(detail)
```

### Transaction

##### getTx(hash: string): Promise\<DIOX.TxDetail>

```
const detail = await web3.txn.getTx("a9cdzqythgtn8078ejhghb74f6s8x9k9v0rcn13azt1fp19wcftg")
cosnole.log(detail)
// output:
{
  "ISN": 2,
  "TTL": 1800000,
  "Hash": "a9cdzqythgtn8078ejhghb74f6s8x9k9v0rcn13azt1fp19wcftg",
  "Mode": "ITM_FIRST_SIGNER|TGM_USER_SIGNED",
  "Size": 181,
  ...
}

```

##### send(originTxn: OriginalTxn, secretKey: Uint8Array | string): Promise\<string>

Send a transaction. The transaction will be constructed and signed locally using the private key, and the signed result will be broadcast to the blockchain. The private key will not be transmitted over the network.

```
const data = aawait web3.txn.send({
  args: {
    Amount: '200000000',
    To: user1.address
  },
  function: 'core.coin.transfer',
  gasprice: '100',
  sender: user0.address,
}, user0.privatekey)

console.log(data) // output:  "5akjfknj9phq93r56kqygjcv3r1tpwm2gt82xex1z3nkrk4r509g"
```

### Type Declaration

see `src/api/type.ts` [link](https://www.npmjs.com/package/@dioxide-js/silas?activeTab=code)
