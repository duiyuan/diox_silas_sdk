export enum DioFunction {
  SET_METADATA = 'core.profile.set',
  SET_SCOPE_METADATA = 'core.profile.address.set',
  FAUCET = 'core.coin.faucet',
  FAUCET_SCOPE = 'core.coin.address.faucet',
  MANAGED_TOKEN = 'Asset.TokenManager.create',
  CREATE_ADDRESS_TOKEN = 'core.delegation.address.create_token',
  CREATE_TOKEN = 'core.delegation.create_token',
  TOKEN_FINALIZE = 'token_finalize@address.delegation.core',
  TOKEN_BID = 'token_bid@address.delegation.core',
  MINT_TOKEN = 'core.token_stats.address.supply_change',
  MINT_NFT = 'nonfungible_init@address.delegation.core',
  MINTED = 'core.coin.global.minted',
  TRANSFER = 'core.coin.transfer',
  TRANSFER_NFT = 'transfer@address.vault.core',
  TRANSFER_TOKENS = 'core.wallet.transfer',
  RECEIVE_TOKENS = 'Asset.Wallet.address.deposit',
  INIT_DAPP = 'core.delegation.create',
  INIT_SCOPE_DAPP = 'core.delegation.address.create',
  MINT = 'core.coin.mint',
  COMPOSE_NFT = 'nft.compose',
  RECEIVE_NFT = 'deposit@address.vault.core',
  SEND_COMPOSED_TX_DATA = 'send_composed_tx_data',
  DEPLOY_CONTRACT = 'core.delegation.address.deploy_contracts',
  SET_TOKEN_MINTER = 'core.delegation.set_token_minter',
  BRX_CLAIM = 'rxbridge.BitReXe.claimBRX',
  BRX_BURN = 'rxbridge.BitReXe.burnRXBTC',
  WALLET_BRX_CLAIM = 'rxbridge.BitReXe.address.claimBRX',
  WALLET_BRX_BURN = 'rxbridge.BitReXe.address.burnRXBTC',
  WALLET_CORE_DEPOSIT = 'core.coin.address.deposit',
  WALLET_DEPOSIT = 'core.wallet.address.deposit',
  WALLET_BITREXE_DEPOSIT = 'rxbridge.BitReXe.address._deposit',
}

export function getDefaultToken() {
  return {
    symbol: 'DIO',
    decimals: 8,
  }
}

export enum NET {
  MAIN = 'main',
  TEST = 'test',
}

export function getProvider(net: Provider) {
  if (net === NET.MAIN) {
    return 'http://127.0.0.1:7600'
  }
  return 'http://127.0.0.1:7600'
}
