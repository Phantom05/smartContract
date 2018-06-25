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
const APPROVE_AMOUNT = 4000000000 //  40억개
const TRANSFER_BASE_AMOUNT = 100
const MAX_TRANSFER_COUNT = 3

contract('SafeTokenTransfer', accounts => {
    let tokenInstance
    let safeTokenTransferInstance

    const owner = accounts[0]

    before(async () => {
        tokenInstance = await NewYeedToken.new(SUPPLY_AMOUNT)
        safeTokenTransferInstance = await SafeTokenTransfer.new()
    })

    describe("1. 신규토큰 컨트렉트 배포", () => {

        it("1-1 Owner 토큰 발행량 조회", async () => {
            const balance = await tokenInstance.balanceOf.call(owner)
            assert.equal(balance.valueOf(), SUPPLY_AMOUNT)
        })

        it("1-2 전체 토큰 발행량 조회", async () => {
            const amount = await tokenInstance.totalSupply()
            assert.equal(amount.valueOf(), SUPPLY_AMOUNT)
        })
    })

    describe("2. 배분 컨트렉트 배포", () => {

        it("2-1 40억개 approve", async () => {
            spenderAddr = safeTokenTransferInstance.address
            const beforeAllowance = await tokenInstance.allowance(owner, safeTokenTransferInstance.address)
            assert.equal(beforeAllowance.valueOf(), 0, "allowance should be zero")
            await tokenInstance.approve(safeTokenTransferInstance.address, APPROVE_AMOUNT)
            const allowance = await tokenInstance.allowance(owner, safeTokenTransferInstance.address)
            assert.equal(allowance.valueOf(), APPROVE_AMOUNT)
        })

        it("2-2 배분 컨트랙트 unlockAddress", async () => {
            const beforeUnlocked = await tokenInstance.unlockAddress(safeTokenTransferInstance.address)
            assert.isFalse(beforeUnlocked)
            await tokenInstance.setUnlockAddress(safeTokenTransferInstance.address, true)
            const unlocked = await tokenInstance.unlockAddress(safeTokenTransferInstance.address)
            assert.isTrue(unlocked)
        })

        it("2-3 토큰 설정", async () => {
            const tokenAddr = tokenInstance.address
            const tokenOwner = await tokenInstance.owner()
            await safeTokenTransferInstance.setupToken(tokenAddr, tokenOwner)
            const yeedTokenAddr = await safeTokenTransferInstance.yeedToken()
            assert.equal(tokenAddr, yeedTokenAddr)
            const yeedTokenOwner = await safeTokenTransferInstance.tokenOwner()
            assert.equal(tokenOwner, yeedTokenOwner)
        })

        it("2-4 토큰 배분", async () => {
            const startAccountIdx = 2
            for (i = startAccountIdx; i < startAccountIdx + MAX_TRANSFER_COUNT; i++) {
                // duplicated transfer to check safety
                await safeTokenTransferInstance.transferToken(accounts[i], TRANSFER_BASE_AMOUNT/2)
                await safeTokenTransferInstance.transferToken(accounts[i], TRANSFER_BASE_AMOUNT)

                const balance = await tokenInstance.balanceOf.call(accounts[i])
                assert.equal(balance.valueOf(), TRANSFER_BASE_AMOUNT)
            }
        })

        it("2-5 토큰 배분결과 확인", async () => {
            const ownerBalance = await tokenInstance.balanceOf.call(owner)
            assert.equal(ownerBalance.valueOf(), SUPPLY_AMOUNT - (TRANSFER_BASE_AMOUNT * MAX_TRANSFER_COUNT))
            const allowanceBalance = await tokenInstance.allowance(owner, safeTokenTransferInstance.address)
            assert.equal(allowanceBalance.valueOf(), APPROVE_AMOUNT - (TRANSFER_BASE_AMOUNT * MAX_TRANSFER_COUNT))
            if (DEBUG_MODE) console.log('\tFINAL ---> ', 'ownerBalance =', ownerBalance.valueOf(), '|', 'allowanceBalance =', allowanceBalance.valueOf())
        })
    })
})
