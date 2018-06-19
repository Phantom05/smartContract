var YeedToken = artifacts.require("./YeedToken.sol")

contract('YeedToken', accounts => {
    it("should put 10 billion YeedToken in the first account", () => {
        return YeedToken.deployed().then(instance => {
            return instance.balanceOf.call(accounts[0]);
        }).then(balance => {
            assert.equal(balance.valueOf(), 10000000000, "10 billion wasn't in the first account")
        })
    })
})