const { Web3, utils, NET } = require('../../lib/commonjs')
const { decode } = require('base64-arraybuffer')
const base32Encode = require('base32-encode')

const user0 = {
  address: '2hh0gc3src6payx9z6wvgkcek0tef9qc8k7j8f312qszyeyp64mn8y9sxr:sm2',
  privatekey: 'NkX61/SdEIajg+lAcHNEgiFiMsjIkf4wQ+CswpkFODQ=',
}
const user1 = {
  address: '0n7cshz6ft9xp583kwn0d50tmdqwq574vysf7k74ay5qqdbg6mcq83pvyw:sm2',
  privatekey: 'jW5DGNREWVA26CJ7Bw6jojlGoF2yHBbh+FuNlQQrkBs=',
}

describe('web3 unit test', () => {
  const web3 = new Web3(NET.LOCAL)

  it('get address balance', async () => {
    const balance = await web3.address.getBalance(user0.address)
    expect(+utils.toTokenAmount(balance.Amount, 8)).toBeGreaterThanOrEqual(0)
  })

  it('get address info', async () => {
    const info = await web3.address.getAddressInfo('core:dapp')
    expect(info.Name).toEqual('core')
  })

  it('get address ISN', async () => {
    const isn = await web3.address.getISN(user0.address)
    expect(isn).toBeNumber
  })

  it('sign data', async () => {
    const raw = await web3.txn.sign(
      {
        args: { Amount: '200000000', To: user1.address },
        function: 'core.coin.transfer',
        gasprice: '100',
        sender: user0.address,
      },
      user0.privatekey,
    )
    expect(raw).not.toBeNull()
  })

  it('sign data & send txn & get txn hash', async () => {
    const regState = await web3.address.getUserRegState({ address: user0.address })
    expect(regState).toBeBoolean
    if (regState) {
      const hash = await web3.txn.send(
        {
          args: { Amount: '200000000', To: 'qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519' },
          function: 'core.coin.transfer',
          gasprice: '100',
          sender: 'qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519',
        },
        user0.privatekey,
      )
      const txn = await web3.txn.getTxn(hash)
      expect(txn.Input.To).toEqual('qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519')
    }
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
    const txnHash = await web3.txn.transfer({
      to: user0.address,
      amount: '10000000000',
      secretKey: user0.privatekey,
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
      owner: '795csryp16ep27cwbhqnj510ddkv904n961kat1tm2vswp37xf878by600:sm2',
    })
    expect(proofs).not.toBeNull()
  })

  /** utils */

  it('to token amount', () => {
    const amount = utils.toTokenAmount('100000000', 8)
    expect(amount).toEqual('1')
  })

  it('is valid address', () => {
    const result = utils.isValidAddress(user0.address)
    expect(result).toEqual(true)
  })

  it('extract publicKey(ed25519)', () => {
    const pk = utils.extractPublicKey('qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519')
    expect(base32Encode(pk, 'Crockford')).toEqual('QZYSDAPQK4Q3442FX59Y2AJNSBX5MAZ3D6JAPB7JNGJRQQ5XQDDG')
  })

  it('address to shard(ed25519)', () => {
    const shardIndex = utils.addressToShard('jrrvex9k5k8pqfghkxrspwxj3965xew0108jzqkybktc9qk85r2h7ycs68:ed25519')
    expect(shardIndex).toEqual(0)
  })
})
