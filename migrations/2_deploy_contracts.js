var ConvertLib = artifacts.require("./ConvertLib.sol");
var RelevantCoin = artifacts.require("./RelevantCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, RelevantCoin);
  deployer.deploy(RelevantCoin);
};
