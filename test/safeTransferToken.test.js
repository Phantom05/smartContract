const NewYeedToken = artifacts.require("./YeedToken.sol")
const SafeTokenTransfer = artifacts.require("./SafeTokenTransfer.sol")
const { expectThrow } = require('./helper.js')
/*
    assert 가능 함수들 : https://github.com/trufflesuite/truffle/blob/beta/lib/testing/Assert.sol
    common -  equal, notEqual
    string - isEmpty, isNotEmpty
    bytes32, address - isZero, isNotZero
    bool - isTrue, isFalse, 
    uint, int - isAbove(>), isAtLeast(>=), isBelow(<), isAtMost(<=), isZero, isNotZero
    unit[], address[], bytes32[] - lengthEqual, lengthNotEqual
    balance - balanceEqual, balanceNotEqual, balanceIsZero, balanceIsNotZero
    internal - 상단 링크 참조... 
 */

const DEBUG_MODE = 0 // if(DEBUG_MODE) console.log()
const SUPPLY_AMOUNT = 10000000000 // 100억개

contract('SafeTokenTransfer', accounts => {
    let owner = accounts[0]

    before(async () => {
        this.token = await NewYeedToken.new(SUPPLY_AMOUNT)
        this.safeTokenTransfer = await SafeTokenTransfer.new()
    })

    describe("1. 신규토큰 컨트렉트 배포", () => {
        it("1-1 Owner 토큰 발행량 조회", async () => {
            let balance = await this.token.balanceOf.call(owner)
            assert.equal(balance.valueOf(), SUPPLY_AMOUNT)
        })

        it("1-2 전체 토큰 발행량 조회", async () => {
            let amount = await this.token.totalSupply()
            assert.equal(amount.valueOf(), SUPPLY_AMOUNT)
        })
    })

    describe("2. 배분 컨트렉트 배포", () => {
        const approveAmount = 4000000000
        let spenderAddr

        it("2-1 40억개 approve", async () => {
            spenderAddr = this.safeTokenTransfer.address
            let beforeAllowance = await this.token.allowance(owner, spenderAddr)
            assert.equal(beforeAllowance.valueOf(), 0, "allowance should be zero")
            await this.token.approve(spenderAddr, approveAmount)
            let allowance = await this.token.allowance(owner, spenderAddr)
            assert.equal(allowance.valueOf(), approveAmount)
        })

        it("2-2 배분 컨트랙트 unlockAddress", async () => {
            let beforeUnlocked = await this.token.unlockaddress(spenderAddr)
            assert.isFalse(beforeUnlocked)
            await this.token.unlockAddress(spenderAddr, true)
            let unlocked = await this.token.unlockaddress(spenderAddr)
            assert.isTrue(unlocked)
        })

        it("2-3 토큰 설정", async () => {
            let tokenAddr = this.token.address
            let tokenOwner = await this.token.owner()
            await this.safeTokenTransfer.setupToken(tokenAddr, tokenOwner)
            let yeedTokenAddr = await this.safeTokenTransfer.yeedToken()
            assert.equal(tokenAddr, yeedTokenAddr)
            let yeedTokenOwner = await this.safeTokenTransfer.tokenOwner()
            assert.equal(tokenOwner, yeedTokenOwner)
        })

        const transferCount = 3
        const transferAmount = 100
        it("2-4 토큰 배분", async () => {
            const startAccountIdx = 2
            for (i = startAccountIdx; i < transferCount + startAccountIdx; i++) {
                // duplicated transfer to check safety
                await this.safeTokenTransfer.transferToken(accounts[i], transferAmount/2)
                await this.safeTokenTransfer.transferToken(accounts[i], transferAmount)

                let balance = await this.token.balanceOf.call(accounts[i])
                assert.equal(balance.valueOf(), transferAmount)
            }
        })

        it("2-5 토큰 배분결과 확인", async () => {
            let ownerBalance = await this.token.balanceOf.call(owner)
            assert.equal(ownerBalance.valueOf(), SUPPLY_AMOUNT - (transferCount * transferAmount))
            let allowanceBalance = await this.token.allowance(owner, spenderAddr)
            assert.equal(allowanceBalance.valueOf(), approveAmount - (transferCount * transferAmount))
            if (DEBUG_MODE) console.log('\tFINAL ---> ', 'ownerBalance =', ownerBalance.valueOf(), '|', 'allowanceBalance =', allowanceBalance.valueOf())
        })
    })
})
