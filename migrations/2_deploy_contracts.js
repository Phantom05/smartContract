var YeedToken = artifacts.require("./token/YeedToken.sol");
var SafeTokenTransfer = artifacts.require("./ico/SafeTokenTransfer.sol");

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(YeedToken, 10**28);
    await deployer.deploy(SafeTokenTransfer);
  })
};
