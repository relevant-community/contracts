// module.exports = {
//   // See <http://truffleframework.com/docs/advanced/configuration>
//   // to customize your Truffle configuration!
//   networks: {
//     development: {
//       host: 'localhost',
//       port: '7545',
//       network_id: '*'
//     }
//   }
// };

var HDWalletProvider = require("truffle-hdwallet-provider");
var secrets = require('./secrets.js')

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      provider: function() {
        return new HDWalletProvider(secrets.truffle, "http://localhost:9545/")
      },
      port: '9545',
      network_id: '*'
    },
    kovan: {
      provider: function() {
        return new HDWalletProvider(secrets.mnemonic, "https://kovan.infura.io/" + secrets.infura, 1)
      },
      network_id: 42,
      gas: 5561260
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(secrets.mnemonic, "https://rinkeby.infura.io/" + secrets.infura)
      },
      network_id: 4,
      gas: 4700000
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(secrets.mnemonic, "https://ropsten.infura.io/" + secrets.infura)
      },
      network_id: 2,
      gas: 5561260
    },
    sokol: {
      provider: function() {
        return new HDWalletProvider(secrets.mnemonic, "https://sokol.poa.network")
      },
      gasPrice: 1000000000,
      network_id: 77
    },
    poa: {
      provider: function() {
        return new HDWalletProvider(secrets.mnemonic, "https://core.poa.network")
      },
      gasPrice: 1000000000,
      network_id: 99
    }
  }
};
