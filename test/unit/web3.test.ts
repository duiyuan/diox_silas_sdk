const { Web3, utils, NET } = require('../../lib/commonjs')
const { decode } = require('base64-arraybuffer')
const base32Encode = require("base32-encode")

describe("web3 unit test", () => {
  const web3 = new Web3(NET.TEST)

  it('get address balance', async () => {
    const balance = await web3.addr
      .getBalance('eqfkk71rg18mcjcp63tkcz4xpcxd91wtd5atpwk82j2jmcdeb50j6es2xm')
    expect(+utils.toTokenAmount(balance, 8)).toBeGreaterThan(0)
  })

  it('get address info', async () => {
    const info = await web3.addr
      .getAddressInfo('eqfkk71rg18mcjcp63tkcz4xpcxd91wtd5atpwk82j2jmcdeb50j6es2xm')
    expect(info.Name).toEqual('forTest')
  })

  it('get address ISN', async () => {
    const isn = await web3.addr.getISN('eqfkk71rg18mcjcp63tkcz4xpcxd91wtd5atpwk82j2jmcdeb50j6es2xm')
    expect(isn).toBeNumber
  })

  it('sign data', async () => {
    const raw = await web3.txn
      .sign({
        args: { Amount: '200000000', To: 'qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519' },
        function: 'core.coin.transfer',
        gasprice: '100',
        sender: 'qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519',
      }, new Uint8Array(decode('KHwdnMOhputNfUWjqhKECx7CeBjgZoWhen0dgsXS34k=')))
    expect(raw).not.toBeNull()
  })

  it('sign data & send txn & get txn hash', async () => {
    const hash = await web3.txn.send(
      {
        args: { Amount: '200000000', To: 'qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519' },
        function: 'core.coin.transfer',
        gasprice: '100',
        sender: 'qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519',
      },
      new Uint8Array(decode('KHwdnMOhputNfUWjqhKECx7CeBjgZoWhen0dgsXS34k=')),
    )
    const txn = await web3.txn.getTxn(hash)
    expect(txn.Input.To).toEqual('qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519')
  })

  it('should get estimated fee', async () => {
    const gas = await web3.txn.getEstimatedFee({
      args: { Amount: '200000000', To: 'qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519' },
      function: 'core.coin.transfer',
      gasprice: '100',
      sender: 'qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519',
    })
    expect(gas).not.toBeNull()
  })

  it('transfer dio', async () => {
    const txnHash = await web3.txn
      .transfer({
        to: 'qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519',
        amount: '10000000000',
        secretKey: new Uint8Array(decode('KHwdnMOhputNfUWjqhKECx7CeBjgZoWhen0dgsXS34k=')),
      })
    expect(txnHash).not.toBeNull()
  })

  it('transfer fca', async () => {
    const txnHash = await web3.txn
      .transferFCA({
        symbol: 'GXX',
        to: 'qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519',
        amount: '10000000000',
        secretKey: new Uint8Array(decode('KHwdnMOhputNfUWjqhKECx7CeBjgZoWhen0dgsXS34k=')),
      })
    expect(txnHash).not.toBeNull()
  })

  it('new proof', async () => {
    const txnHash = await web3.proof.newProof({
      content: 'sdk unit test',
      key: 'test234',
      sender: '795csryp16ep27cwbhqnj510ddkv904n961kat1tm2vswp37xf878by600:sm2',
      secretKey: new Uint8Array(decode('gMAsFkh3C6Q63XAd+MoZC7BUrQTCAi8DAEzHGDXJOqc=')),
  })
    expect(txnHash).not.toBeNull()
  })

  it('get proof', async () => {
    const proofs = await web3.proof.getProofs({
    owner: '795csryp16ep27cwbhqnj510ddkv904n961kat1tm2vswp37xf878by600:sm2'
  })
    expect(proofs).not.toBeNull()
  })

  /** utils */

  it('to token amount', () => {
    const amount = utils.toTokenAmount('100000000', 8)
    expect(amount).toEqual('1')
  })

  it('is valid address', () => {
    const result = utils.isValidAddress('qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420')
    expect(result).toEqual(true)
  })

  it('extract publicKey', () => {
    const pk = utils.extractPublicKey('qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420')
    expect(base32Encode(pk, 'Crockford')).toEqual('QZYSDAPQK4Q3442FX59Y2AJNSBX5MAZ3D6JAPB7JNGJRQQ5XQDDG')
  })

  it('address to shard', () => {
    const shardIndex = utils.addressToShard('jrrvex9k5k8pqfghkxrspwxj3965xew0108jzqkybktc9qk85r2h7ycs68:ed25519')
    expect(shardIndex).toEqual(0)
  })

  it('generateAddress with shardIndex', async () => {
    const targetShardIndex = 2
    const { address } = await utils.generateAddress(targetShardIndex)
    const shardIndex = utils.addressToShard(address)
    expect(shardIndex).toEqual(targetShardIndex)
  })
})