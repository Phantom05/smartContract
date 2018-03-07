var YeedToken = artifacts.require("./token/YeedToken.sol");
var YggdrashCrowdSale = artifacts.require("./ico/YggdrashCrowdSale.sol");

module.exports = function(deployer) {
  deployer.deploy(YeedToken, "400340000000000000000000000");
  deployer.deploy(YggdrashCrowdSale, Wallet, "400340000000000000000000000", 2500);




};
