var YeedToken = artifacts.require("./token/YeedToken.sol");
var SafeTokenTransfer = artifacts.require("./ico/SafeTokenTransfer.sol");
var SwapToken = artifacts.require("./ico/SwapToken.sol");

module.exports = function(deployer) {
  deployer.deploy(YeedToken, "10000000000");
};
