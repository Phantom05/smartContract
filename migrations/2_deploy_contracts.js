var YeedToken = artifacts.require("./token/YeedToken.sol");
var YggdrashCrowd = artifacts.require("./ico/YggdrashCrowd.sol");

module.exports = function(deployer) {
  deployer.deploy(YeedToken, "400340000000000000000000000");
};
