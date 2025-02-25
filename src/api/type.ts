export declare namespace DIOX {
  interface MetaData {
    Description?: string
    IconUrl?: string
    Name?: string
    Website?: string
    Social?: {
      Github: string
      Discord: string
      Twitter: string
      Telegram: string
      Facebook: string
      Email: string
    }
  }

  interface TxSummary {
    Height: number
    ShardIndex: number
    ExecIndex: number
    RelayGroupIndex: number
    ShardOrder: number
    BlockTime: number
    TxnHash: string
    TxnType: string
    Initiator: string
    Target: string
    OriginalTxnHash: string
    Invocation: Invocation
    TxnTime: number
    Func: string
  }

  interface DepositTxSum {
    Address: string
    TokenSymbol: string
    AcType: string
    TokenAmount: string
    Height: number
    ShardIndex: number
    ExecIndex: number
    RelayGroupIndex: number
    ShardOrder: number
    BlockTime: number
    TxnHash: string
    TxnType: string
    Initiator: string
    Target: string
    OriginalTxnHash: string
    IsFinalized: 1
    Func: string
    Contract: string
    Invocation: {
      Input: {
        [key: string]: any
      }
      GasFee: string
      Return: [number, number]
      GasPrice: string
      GasOffered: number
    }
    Sort: number
    TokenDecimals: number
  }

  interface TxDetail {
    BlockTime: number
    Height: number
    Initiator: string
    Address: string
    BuildNum: number
    ConfirmedBy: string
    ConfirmState?: string
    ExecStage: string
    Function: string
    GasOffered: number
    GasPrice: string
    Grouped: false
    Hash: string
    Packing?: string
    Relays?: Array<TxDetail>
    Input: {
      [key: string]: string | number
    }
    Invocation: Invocation
    Mode: string
    OrigExecIdx: number
    OrigTxHash: string
    Shard: number[]
    Size: number
    Signers?: string[]
    Timestamp: number
    ISN?: number
  }

  interface Block {
    Size: number
    Scope: string
    Throughput: number
    Shard: [number, number]
    Prev: string
    BlockInterval: number
    Consensus: number
    ScheduledTxnCount: number
    UserInitiatedTxnCount: number
    IntraRelayTxnCount: number
    InboundRelayTxnCount: number
    OutboundRelayTxnCount: number
    DeferredRelayTxnCount: number
    DispatchedRelayTxnCount: number
    ExecutionCount: number
    MasterBlock: string
    BlockMerkleLeaf: string
    ConfirmedTxnHash: string
    ConfirmedTxnMerkle: string
    ConsensusHeaderHash?: string
    ProcessedTxnMerkle: string
    ChainStateMerkle: string
    GlobalChainStateMerkle: string
    GlobalProcessedTxnMerkle: string
    GlobalTxnBlockMerkleLeaf: string
    ShardOutboundRelayMerkle: string
    ShardProcessedTxnMerkle: string
    ShardTxnBlockMerkle: string
    ShardOrder?: number
    TotalGasFee: string
    AvgGasPrice: string
    Hash: string
    Height: number
    Timestamp: number
    Miner: string
    Stage: string
    State: string
    PowDifficulty: number
    PowNonce: string
    ScalingNext: boolean
    Uncles: string[]
    Transactions: {
      Scheduled: string[]
      Confirmed: string[]
      DispatchRelays: string[]
      Deferred: string[]
    }
    Snapshot?: string
  }

  interface Invocation {
    Return: [number, number]
    Input: {
      Reward: string
      Amount: string
      To: string
      [key: string]: any
    }
    GasOffered?: string
    GasPrice?: string
    GasFee?: string
    TokenSupply?: string[]
  }

  interface ExcutedTx {
    Height: number
    BlockTime: number
    Initiator: string
    Target: string
    IsFinalized: number | undefined
    OriginalTxnHash: string
    Invocation: Invocation
    Func: string
    Contract: string
    TxnHash: string
    TxnStatus: string
    RelayReturn: string
    TokenSymbol?: string
    TokenInitial?: string
    TokenDecimals?: number
    RelayGroupIndex: number
    TokenAmount?: string
  }

  interface BlockResp {
    TotalNum: number
    ListData: ExcutedTx[]
  }

  interface Address {
    Symbol?: string
    Delegator?: string
    TotalSupply?: string
    ID?: number
    Flags?: number
    Metadata?: MetaData
    Address?: string
    Balance?: string
    Height?: number
    Name?: string
    Hash?: string
    Wallet?: { [id: string]: string | number }[]
    Definition?: {
      hash: string
      name: string
      series: number
    }
  }

  interface ChainStatus {
    BlockInterval: number
    ForkRate: number
    TotalBlocks: number
    Difficulty: number
    AvgGasPrice: number
    ShardOrder: number
    Throughput: number
    TotalTxn: number
    TotalStateSize: number
    MempoolSize: number
    AddressCount: number
    Height: number
    DeployName: string
    ChainVersion: number
    NumShards: number
  }
}

export interface OriginalTxn {
  gasprice?: string | number
  sender: string
  function: string
  args: KeyValue
  delegatee?: string | number
  gaslimit?: string | number
  tokens?: { [key: string]: string }[]
  ttl?: number
  scale?: number
}

export interface AddrBalance {
  Address: string
  Height: number
  State: {
    Balance: string
  }
  Wallet: { symbol: string; amount: string }[]
}

export interface TxDetailResponse {
  Hash: string
  Content: DIOX.TxDetail
}

export type DioxScanTxResponse = CommonResponse<{
  TotalNum: number
  ListData: DIOX.TxSummary[]
}>

export interface TokenItem {
  Address?: string
  TokenID: number
  Amount?: string
  Symbol: string
  Height?: number
  FutureMint?: number
  Decimals: number
  Balance?: number | string
  Wallet?: { symbol: string; amount: string }[]
  IconUrl?: string
  Metadata?: DIOX.MetaData
}

export interface AddrBaseInfo {
  Address: string
  State: {
    Metadata: DIOX.MetaData
  }
}

export interface Blocks {
  TotalNum: number
  TxType: string
  ListData: DIOX.Block[]
}

export type DioxScanChainBasicInfo = CommonResponse<DIOX.ChainStatus>

export type Override = CommonResponse<{
  Address: string
  Height: number
  NextISN: number
}>
