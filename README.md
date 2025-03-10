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

const web3 = new Web3(NET.TEST)

// Get the balance of an address
const balance = await web3.addr.getBalance('0x1234567890abcdef1234567890abcdef12345678')

// Transfer dio
const txnHash = await web3.txn.transfer({
  to: '0x1234567890abcdef1234567890abcdef12345678:ed25519',
  amount: '10000000000',
  secretKey: secretKey,
})

// Transfer fca token
const txnHash = await web3.txn.transferFCA({
  symbol: 'FCA',
  to: '0x1234567890abcdef1234567890abcdef12345678:ed25519',
  amount: '10000000000',
  secretKey: secretKey,
})
```

## API

### web3.addr

#### web3.addr.getBalance(address: string)

```js
const balance = await web3.addr.getBalance('eqfkk71rg18mcjcp63tkcz4xpcxd91wtd5atpwk82j2jmcdeb50j6es2xm')
// '1000000000000000000000'
```

#### web3.addr.getISN(address: string)

```js
const isn = await web3.addr.getISN('eqfkk71rg18mcjcp63tkcz4xpcxd91wtd5atpwk82j2jmcdeb50j6es2xm')
// 1
```

#### web3.addr.getAddressInfo(address: string): [DIOX.AddressBaseInfo](#dioxaddressbaseinfo)

```js
const info = await web3.addr.getAddressInfo('eqfkk71rg18mcjcp63tkcz4xpcxd91wtd5atpwk82j2jmcdeb50j6es2xm')
{
  Address: 'eqfkk71rg18mcjcp63tkcz4xpcxd91wtd5atpwk82j2jmcdeb50j6es2xm:ed25519',
  ShardOrder: 2,
  ShardIndex: 2,
  State: {
    Metadata: {
      Name: 'address Name',
      Description: 'address Description',
      IconUrl: 'address Icon'
      Website: 'https://address.website.com',
      Social: {
        Github: string
        Discord: string
        Twitter: string
        Telegram: string
        Facebook: string
        Email: string
      }
    }
  }
}
```

#### web3.addr.getTxnListByAddress(params: [ListParmas](#listparmas)[]): [DIOX.TxSummary](#dioxtxsummary)[]

```js
const txnList = await web3.addr.getTxnListByAddress({address: 'eqfkk71rg18mcjcp63tkcz4xpcxd91wtd5atpwk82j2jmcdeb50j6es2xm'})
{
  TotalNum: 404,
  ListData: DIOX.TxSummary[]
}
```

### web3.txn

#### web3.txn.sign(txdata: [OriginalTxn](#originaltxn), secretKey: string)

```js
const txn = await web3.txn.sign(
  {
    sender: 'eqfkk71rg18mcjcp63tkcz4xpcxd91wtd5atpwk82j2jmcdeb50j6es2xm:ed25519',
    gasprice: 100,
    function: 'core.wallet.transfer',
    args: {
      Amount: '10000000000',
      To: 'qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519',
      TokenId: 'GXX',
    },
    ttl: '30',
    tokens: [{'FXX': '10000000000'}]
  },
  secretKey,
)
{
  rawTxData: base64rawdata,
  hash: 'wkapenmgkqre483cg344a8bxstrq4nsj1matcdmtjna03tcmkc10'
}
```

#### web3.txn.send(originalTxn: [OriginalTxn](#originaltxn), secretKey: string)

```js
const txHash = await web3.txn.send(
  {
    sender: 'eqfkk71rg18mcjcp63tkcz4xpcxd91wtd5atpwk82j2jmcdeb50j6es2xm:ed25519',
    gasprice: 100,
    function: 'core.wallet.transfer',
    args: {
      Amount: '10000000000',
      To: 'eqfkk71rg18mcjcp63tkcz4xpcxd91wtd5atpwk82j2jmcdeb50j6es2xm:ed25519',
      TokenId: 'GXX',
    },
    ttl: '30',
  },
  secretKey,
)
//wkapenmgkqre483cg344a8bxstrq4nsj1matcdmtjna03tcmkc10
```

#### web3.txn.getTxn(hash: string): [DIOX.TxDetail](#dioxtxdetail)

```js
const txn = await web3.txn.getTxn('wkapenmgkqre483cg344a8bxstrq4nsj1matcdmtjna03tcmkc10')
//DIOX.TxDetail
```

#### web3.txn.getEstimatedFee(originTxn: [OriginalTxn](#originaltxn))

```js
const txn = await web3.txn.getEstimatedFee({
  sender: '0x1234567890abcdef1234567890abcdef12345678:ed25519',
  gasprice: 100,
  function: 'core.wallet.transfer',
  args: {
    Amount: '10000000000',
    To: '0x1234567890abcdef1234567890abcdef12345678:ed25519',
    TokenId: 'FCA',
  },
})
//95500
```

#### web3.txn.transfer({to: string, amount: string, secretKey: Unit8Array })

```js
const txnHash = await web3.txn.transfer({
  to: '0x1234567890abcdef1234567890abcdef12345678:ed25519',
  amount: '10000000000',
  secretKey: secretKey,
})
//txnHash
```

## types

### DIOX.MetaData

```js
interface MetaData {
    Description: string;
    IconUrl: string;
    Website: string;
    Social: {
        Github: string;
        Discord: string;
        Twitter: string;
        Telegram: string;
        Facebook: string;
        Email: string;
    };
}
```

### DIOX.AddressBaseInfo

```js
interface AddrBaseInfo {
    Address: string;
    State: {
        Metadata: DIOX.MetaData;
    };
}
```

### DIOX.TxSummary

```js
interface TxSummary {
    Height: number;
    ShardIndex: number;
    ExecIndex: number;
    RelayGroupIndex: number;
    ShardOrder: number;
    BlockTime: number;
    TxnHash: string;
    TxnType: string;
    Initiator: string;
    Target: string;
    OriginalTxnHash: string;
    Invocation: Invocation;
    TxnTime: number;
    Func: string;
}
```

### DIOX.TxDetail

```js
interface TxDetail {
    BlockTime: number;
    Height: number;
    Initiator: string;
    Address: string;
    BuildNum: number;
    ConfirmedBy: string;
    ConfirmState?: string;
    ExecStage: string;
    Function: string;
    GasOffered: number;
    GasPrice: string;
    Grouped: false;
    Hash: string;
    Packing?: string;
    Relays?: Array<TxDetail>;
    Input: {
        [key: string]: string | number;
    };
    Invocation: Invocation;
    Mode: string;
    OrigExecIdx: number;
    OrigTxHash: string;
    Shard: number[];
    Size: number;
    Signers?: string[];
    Timestamp: number;
    ISN?: number;
}
```

### OriginalTxn

```js
interface OriginalTxn {
    gasprice: string | number;
    sender: string;
    function: string;
    args: KeyValue;
    delegatee?: string | number;
    gaslimit?: string | number;
    tokens?: {
        [key: string]: string;
    }[];
    ttl: string | number;
    scale?: number;
}
```

### ListParmas

```js
interface ListParams {
  address: string
  addresstxntype?: string
  shardIndex?: string
  height?: number
  pos?: number
  limit?: number
}
```

## Package.json Scripts

| Script      | Description                                         |
| ----------- | --------------------------------------------------- |
| watch       | Uses `tsc` to build all packages with watch mode    |
| build       | Uses `tsc` to build all packages                    |
| build:cjs   | Uses `tsc` to build all packages to commonjs module |
| build:esm   | Uses `tsc` to build all packages to es module       |
| build:types | Uses `tsc` to build all packages to ts types        |
| build:check | Uses `node` to check packages build                 |
| lint        | Uses `eslint` to lint all packages                  |
| lint:fix    | Uses `eslint` to check and fix any warnings         |
| test        | Uses `jest` to run unit tests in each package       |
