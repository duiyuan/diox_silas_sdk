const { Web3, NET } = require('../dist/cjs/index.js')
const { user } = require('./conf')

const web3 = new Web3(NET.UAT, {
  apiKey: 'sk_CDdiLOUG31vArLW35incaSkclHVBiB7yNQQ3YbNJh1M',
})
const dapp = 'trump01'
const name = 'ProofMe'
const contract1 = `
contract ${name} {
    @shard scattered_map<hash, string> proofs;

    @address function new(string key, string content) public export const {
        address sender = __transaction.get_sender();
        hash proof_key = hash(string(sender).append(key));
        address proof_addr = address(proof_key);
        relay@proof_addr _new(sender, proof_key, content);
    }

    @address function _new(address owner, hash key, string content) {
        proofs[key] = content;
        // __debug.print("New ProofOfExistence success, key:", key, ", content:", content);
    }

    @address function bool check(hash key) public {
        return proofs.has(key);
    }


    @address function string get(hash proof_key) public {
        string content = "";
        if (proofs.has(proof_key)) {
            content = proofs[proof_key];
        }
        // __debug.print("ProofOfExistence get by key: ", proof_key, ", content: ", content);
        return content;
    }

}`

async function start() {
  // mint
  const mint = await web3.contract.mint(user.privatekey, user.address)
  console.log('mint =>', mint)
  //

  // bid dapp
  const bidHash = await web3.contract.createDApp(user.privatekey, user.address, dapp)
  console.log('new dapp =>', bidHash)

  // deploy contract
  const deployHash = await web3.contract.deploy(user.privatekey, {
    delegatee: dapp + ':dapp',
    code: [contract1],
    cargs: [''],
  })
  console.log('deploy =>', deployHash)

  // retrive constract abi
  const abi = await web3.contract.abi(dapp + '.' + name)
  console.log('abi =>', abi)

  // const invokeHash = await web3.contract.run(user.privatekey, {
  //   sender: user.address,
  //   func: `${dapp}.${name}.new`,
  //   args: { key: 'a', content: 'b' },
  // })
  // console.log('run contract function =>', invokeHash)

  return true
}

start().then(console.log).catch(console.error)
