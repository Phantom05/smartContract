var YeedToken = artifacts.require("./YeedToken.sol")

contract('YeedToken', function(accounts) {
    describe("# Yeed 토큰 발행", function() {
        it("should put 10 billion YeedToken in the first account", function() {
            return YeedToken.deployed().then(function(instance) {
                return instance.balanceOf.call(accounts[0]);
            }).then(function(balance) {
                assert.equal(balance.valueOf(), 10000000000, "10 billion wasn't in the first account")
            })
        })
    })

    describe("거래소 상장 전", function() {
        it("신규 토큰 Deploy", function() {
            assert.ok(false)
        })
    })
})