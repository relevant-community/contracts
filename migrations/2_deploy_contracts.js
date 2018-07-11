let RelevantCoin = artifacts.require('./RelevantCoin.sol');
let ECRecovery = artifacts.require('zeppelin-solidity/contracts/ECRecovery.sol');

module.exports = function (deployer) {
  deployer.deploy(ECRecovery);
  deployer.link(ECRecovery, RelevantCoin);
  deployer.deploy(RelevantCoin);
};
