var Wallet = artifacts.require("./wallet/Wallet.sol");
var IcxToken = artifacts.require("./token/YeedToken.sol");
var IconCrawSale = artifacts.require("./ico/YggdrashCrowdSale.sol");

module.exports = function(deployer) {
  deployer.deploy(Wallet);
  deployer.deploy(IcxToken, "400340000000000000000000000", Wallet);
  deployer.deploy(IconCrawSale, Wallet, "400340000000000000000000000", 2500);




};
