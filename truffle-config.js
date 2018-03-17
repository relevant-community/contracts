require('dotenv').config();
require('babel-register');
require('babel-polyfill');

const HDWalletProvider = require('truffle-hdwallet-provider');
const secrets = require('./secrets.js');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: 'localhost',
      port: 7545,
      network_id: '*', // Match any network id
      // gas: 0xfffffffffff,
      gasPrice: 23000000000,
      // gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01     // <-- Use this low gas price
      // provider: function() {
      //   return new HDWalletProvider(secrets.truffle, 'http://localhost:7545/')
      // },
      // port: '9545',
      // network_id: '*'
    },
    coverage: {
      host: 'localhost',
      network_id: '*',
      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01     // <-- Use this low gas price
    },
    // testrpc: {
    //   host: 'localhost',
    //   port: 8545,
    //   network_id: '*', // eslint-disable-line camelcase
    // },
    kovan: {
      provider: function () {
        return new HDWalletProvider(secrets.mnemonic, 'https://kovan.infura.io/' + secrets.infura, 1);
      },
      network_id: 42,
      gas: 5561260
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(secrets.mnemonic, 'https://rinkeby.infura.io/' + secrets.infura);
      },
      network_id: 4,
      gas: 4700000
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(secrets.mnemonic, 'https://ropsten.infura.io/' + secrets.infura);
      },
      network_id: 2,
      gas: 5561260
    },
    sokol: {
      provider: function () {
        return new HDWalletProvider(secrets.mnemonic, 'https://sokol.poa.network');
      },
      gasPrice: 1000000000,
      network_id: 77
    },
    poa: {
      provider: function () {
        return new HDWalletProvider(secrets.mnemonic, 'https://core.poa.network')
      },
      gasPrice: 1000000000,
      network_id: 99
    }
  }
};
