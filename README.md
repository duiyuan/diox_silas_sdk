# @dioxide-js/silas

@dioxide-js/silas is a Nodejs SDK implementation of the [Silas RPC API](#)

## Installation

using npm

```bash
npm install @dioxide-js/silas
```

using yarn

```bash
yarn add @dioxide-js/silas
```

## Getting Started

All the [Type Declaration](./src/api/type.ts).

### Initialize

```js
import { Web3, NET } from '@dioxide-js/silas'
import { dataview } from '@dioxide-js/misc'

const web3 = new Web3(NET.TEST) // const web3 = new Web3(NET.MAIN); // For production
const user0 = {
  address: 'jjkw5p9fz7nk0zfy6171ch0dy8bk16mhgpwkdcrc4rpt4sfzpvht9za2qr:sm2',
  privatekey: 'AyyogAYL5nVC5CsrTxdYe9IBXOppNqsGd+hSHn+QT68=',
  id: 'stest01',
}

const privatekeyU8 = dataview.base64ToU8(user0.privatekey)
```

### Proofs

##### newProof(p: NewProofByProofHashParams): Promise\<string\>

To set a proof and retrieve tx hash as result.

```
const txnHash = await web3.proof.newProof({
  content: 'sdk unit test',
  key: 'test234',
  sender: user0.address,
  secretKey: user0.privatekey,
})
```

##### getProofs(p: GetProofsParams): Promise\<Proof\>

```
const proofs = await web3.proof.getProofs({
  owner: user0.address,
})
```

#### Account

##### generate(alg: Alg = 'sm2', privatekey?: Uint8Array | string): Promise\<AddressGenerated\>

```
const result = await web3.account.generate('sm2')
console.log(result.pk, result.sk, result.address)
```

##### getRegState(p: RegsiterOption): Promise\<boolean>

```
const registed = await web3.account.getRegState({address: user0.address})
```

##### register(p: RegsiterOption): Promise\<boolean>

```
const registed = await web3.account.register({id: user0.id})
```

## Overview

##### chainStatus(): Promise\<DIOX.ChainStatus>

```
const status = await web3.overview.chainStatus()
console.log(status.Throughput) // output: 100.03
```

##### getGasPrice(): Promise\<number>

```
const price = await web3.overview.getGasPrice()
console.log(price) // output: 30000
```

##### getTxHistory(p: params: DIOXScanReq.History): Promise\<TxSumList>

```
const list = await web3.overview.getTxHistory()
console.log(list)
```

## Address

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
const profile = await web3.address.getAddressInfo({address: user0.address})
console.log(profile)
```

## Block

##### getExcutedTx(params: { height: number; limit?: number; pos?: number }): Promise\<DIOX.ExcutedTx | undefined>

```
const tx = await web3.block.getExcutedTx()
console.log(tx)
```

##### detail(hash: string): Promise\<DIOX.Block>

```
const detail = await web3.block.detail()
console.log(detail)
```

## Transaction

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

##### sign(originalTxn: OriginalTxn, secretKey: Uint8Array | string, option?: AlgOption): Promise\<SignedData>

Construct and sign the transaction locally using the private key. Return the signed result. The private key will not be transmitted over the network.

```
const data = await web3.txn.sign({
  args: {
    Amount: '200000000',
    To: user1.address
  },
  function: 'core.coin.transfer',
  gasprice: '100',
  sender: user0.address,
}, user0.privatekey)

console.log(data)
// output:
{
  signature: "FrPY1vIDx1CrpSiNbko3CPL...",
  rawTxData: "QAD066yhlQEHA...",
  hash: "5akjfknj9phq93r56kqygjcv3r1tpwm2gt82xex1z3nkrk4r509g",
}
```

##### send(originTxn: OriginalTxn, secretKey: Uint8Array | string): Promise\<string>

Send a transaction. The transaction will be constructed and signed locally using the private key, and the signed result will be broadcast to the blockchain. The private key will not be transmitted over the network.

```
const data = aawait web3.txn.sign({
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
