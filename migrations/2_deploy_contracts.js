var YeedToken = artifacts.require("./token/YeedToken.sol");
var SafeTokenTransfer = artifacts.require("./ico/SafeTokenTransfer.sol");

module.exports = function(deployer) {
  deployer.deploy(YeedToken, "10000000000");
};
