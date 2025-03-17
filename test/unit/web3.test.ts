const { Web3, utils, NET } = require('../../lib/commonjs')
const base32Encode = require('base32-encode')
const decode = require('base32-decode')

const user0 = {
  address: 'jjkw5p9fz7nk0zfy6171ch0dy8bk16mhgpwkdcrc4rpt4sfzpvht9za2qr:sm2',
  privatekey: 'AyyogAYL5nVC5CsrTxdYe9IBXOppNqsGd+hSHn+QT68=',
  id: 'stest01',
}
const user1 = {
  address: 'a7nhcxs8c3jt943gwbq7jddncqrzzc73v4nrvvqhvkcrhw957r4s897n7w:sm2',
  privatekey: 'SY4XI7L7oZr2RMPsQd88wsWeMRvOJeK6RhgG++t6XXc=',
  id: 'stest02',
}

const web3 = new Web3(NET.LOCAL)

describe('Web3 Tests', () => {
  beforeAll(async () => {
    try {
      await web3.account.register({ id: 'stest01' })
    } catch (ex) {}
    try {
      await web3.account.register({ id: 'stest02' })
    } catch (ex) {}
  })

  describe('Address Module Tests', () => {
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
      expect(isn).toBeNumber()
    })
  })

  describe('Tx Module Tests', () => {
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
      expect(raw.signature).not.toBeNull()
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
        await new Promise((resolve) => setTimeout(resolve, 3000))
        const txn = await web3.txn.getTx(hash)
        expect(txn.Content.Input.To).toEqual('qzysdapqk4q3442fx59y2ajnsbx5maz3d6japb7jngjrqq5xqddh60n420:ed25519')
      }
    })
  })

  describe('Utils Tests', () => {
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

  describe('Proof Module Tests', () => {
    it('new proof and get proofs', async () => {
      const txnHash = await web3.proof.newProof({
        content: 'sdk unit test',
        key: 'test234',
        sender: user0.address,
        secretKey: user0.privatekey,
      })
      expect(txnHash).not.toBeNull()

      const proofs = await web3.proof.getProofs({
        owner: user0.address,
      })
      expect(proofs).not.toBeNull()
    })
  })

  describe('Account Module Tests', () => {
    it('account.generate(sm2)', async () => {
      const result = await web3.account.generate('sm2')

      expect(result.privatekey).toBeString()
      expect(result.publickey).toBeString()

      expect(result.sku8.length).toEqual(32)
      expect(result.pku8.length).toEqual(64)
      expect(result.lpku8.length).toEqual(65)
    })

    it('account.reg_state should be false for unregsited user/id', async () => {
      const result = await web3.account.generate('sm2')
      expect(result.address).toBeString()

      const state = await web3.account.getRegState({ address: result.address })
      expect(state).toBeFalse()
    })

    it('account.reg_state should be true for registed user/id', async () => {
      const state = await web3.account.getRegState({ address: user1.address })
      expect(state).toBeTrue()
    })
  })

  describe('Web3 Unit Test', () => {
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
  })
})
