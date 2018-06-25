var YeedToken = artifacts.require("./token/YeedToken.sol");
var SafeTokenTransfer = artifacts.require("./ico/SafeTokenTransfer.sol");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(YeedToken, "10000000000");
    await deployer.deploy(SafeTokenTransfer);
  })
};
