var YeedToken = artifacts.require("./token/YeedToken.sol");

module.exports = function(deployer) {
  deployer.deploy(YeedToken, "10000000000");
};
