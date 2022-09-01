const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
    "require oil dog imitate claim type artist desk laugh modify quality amused",
    "https://rinkeby.infura.io/v3/9c63b6cbf28b44e98745fd06f7d85601"
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ gas: '1000000', from: accounts[0] });

    console.log('Contract deployed to', result.options.address);
    console.log(interface);
    provider.engine.stop();
};
deploy();
