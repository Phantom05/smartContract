const OldYeedToken = artifacts.require("./YeedToken.sol")
const NewYeedToken = artifacts.require("./YeedToken.sol")
const SwapToken = artifacts.require("./SwapToken.sol")
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
const SWAPABLE_AMOUNT = 3000000 // 300만개
const SWAP_BASE_AMOUNT = 100

contract('SwapToken', accounts => {
    let oldTokenInstance
    let tokenInstance
    let swapTokenInstance

    const owner = accounts[0]
    const swapOwner = accounts[1]
    const aliceAccount = accounts[2]
    const bobAccount   = accounts[3]
    const cindyAccount = accounts[4]

    before(async () => {
        oldTokenInstance = await OldYeedToken.new(SUPPLY_AMOUNT)
        tokenInstance = await NewYeedToken.new(SUPPLY_AMOUNT)
        swapTokenInstance = await SwapToken.new({from: swapOwner})
    })

    describe("1. 기존토큰 컨트렉트 준비", () => {

        it("1-1 토큰 발행량 조회", async () => {
            const balance = await oldTokenInstance.balanceOf.call(owner)
            assert.equal(balance.valueOf(), SUPPLY_AMOUNT)
            const amount = await oldTokenInstance.totalSupply()
            assert.equal(amount.valueOf(), SUPPLY_AMOUNT)
        })

        it("1-2 테스트 계정 토큰 배분", async () => {
            await oldTokenInstance.unlockAddress(owner, true)
            await oldTokenInstance.transfer(aliceAccount, SWAP_BASE_AMOUNT/2) // 50
            await oldTokenInstance.transfer(bobAccount, SWAP_BASE_AMOUNT)     // 100
            await oldTokenInstance.transfer(cindyAccount, SWAP_BASE_AMOUNT*2) // 200
            const balance = await oldTokenInstance.balanceOf.call(owner)
            assert.equal(balance.valueOf(), SUPPLY_AMOUNT-350)
        })
    })

    describe("2. 신규토큰 컨트렉트 준비", () => {

        it("2-1 토큰 발행량 조회", async () => {
            const balance = await tokenInstance.balanceOf.call(owner)
            assert.equal(balance.valueOf(), SUPPLY_AMOUNT)
            const amount = await tokenInstance.totalSupply()
            assert.equal(amount.valueOf(), SUPPLY_AMOUNT)
        })
    })

    describe("3. 스왑 컨트렉트 준비", () => {

        it("3-1 스왑 컨트랙트 설정", async () => {
            await swapTokenInstance.setupToken(oldTokenInstance.address, tokenInstance.address, owner, {from: swapOwner})
            await swapTokenInstance.swapAble(true, {from: swapOwner})
            const isSwap = await swapTokenInstance.swap_able({from: swapOwner})
            assert.isTrue(isSwap)
        })

        it("3-2 300만개 approve", async () => {
            await tokenInstance.approve(swapTokenInstance.address, SWAPABLE_AMOUNT)
            const allowance = await tokenInstance.allowance(owner, swapTokenInstance.address)
            const swapableToken = await swapTokenInstance.swapAbleToken()
            assert.equal(allowance.valueOf(), swapableToken.valueOf())
        })

        it("3-2 스왑 컨트랙트 unlockAddress", async () => {
            await oldTokenInstance.unlockAddress(swapTokenInstance.address, true)
            await tokenInstance.unlockAddress(swapTokenInstance.address, true)
            const oldTokenUnlocked = await oldTokenInstance.unlockaddress(swapTokenInstance.address)
            assert.isTrue(oldTokenUnlocked)
            const tokenUnlocked = await tokenInstance.unlockaddress(swapTokenInstance.address)
            assert.isTrue(tokenUnlocked)
        })
    })

    describe("4. 스왑 컨트렉트 테스트", () => {

        it("4-1 Alice 스왑", async () => {
            let tx = swapTokenInstance.swapToken(SWAP_BASE_AMOUNT/10, {from: aliceAccount})
            await expectThrow(tx) // not approved
            oldTokenInstance.approve(swapTokenInstance.address, SWAP_BASE_AMOUNT/2, {from: aliceAccount})
            tx = swapTokenInstance.swapToken(SWAP_BASE_AMOUNT, {from: aliceAccount})
            await expectThrow(tx) // balance is less than swap amount

            await swapTokenInstance.swapToken(SWAP_BASE_AMOUNT/2, {from: aliceAccount}) // swap 50
            const oldTokenBalance = await oldTokenInstance.balanceOf.call(aliceAccount)
            assert.equal(oldTokenBalance.valueOf(), 0)
            const newTokenBalance = await tokenInstance.balanceOf.call(aliceAccount)
            assert.equal(newTokenBalance.valueOf(), SWAP_BASE_AMOUNT/2)
        })

        it("4-2 Bob 스왑", async () => {
            oldTokenInstance.approve(swapTokenInstance.address, SWAP_BASE_AMOUNT, {from: bobAccount})
            await swapTokenInstance.swapToken(SWAP_BASE_AMOUNT, {from: bobAccount}) // swap 100
            const oldTokenBalance = await oldTokenInstance.balanceOf.call(bobAccount)
            assert.equal(oldTokenBalance.valueOf(), 0)

            const tx = swapTokenInstance.swapToken(1, {from: bobAccount})
            await expectThrow(tx) // all balances is swapped aleady
        })

        it("4-3 Cindy 스왑", async () => {
            oldTokenInstance.approve(swapTokenInstance.address, SWAP_BASE_AMOUNT, {from: cindyAccount})
            const tx = swapTokenInstance.swapToken(SWAP_BASE_AMOUNT*2, {from: cindyAccount})
            await expectThrow(tx) // approve amount is less than swap amount

            await swapTokenInstance.swapToken(SWAP_BASE_AMOUNT, {from: cindyAccount}) // swap 100
            const oldTokenBalance = await oldTokenInstance.balanceOf.call(cindyAccount)
            assert.equal(oldTokenBalance.valueOf(), SWAP_BASE_AMOUNT) // balance 100
        })

        it("4-4 스왑 컨트랙트 잔고 인출", async () => {
            const swapableToken = await swapTokenInstance.swapAbleToken()
            assert.equal(swapableToken.valueOf(), SWAPABLE_AMOUNT - 250) // allice=50,bob=100,cindy=100

            let swappedBalance = await oldTokenInstance.balanceOf(swapTokenInstance.address)
            assert.equal(swappedBalance.valueOf(), 250)
            let ownerBalance = await oldTokenInstance.balanceOf.call(owner)
            assert.equal(ownerBalance.valueOf(), SUPPLY_AMOUNT - 350)

            await swapTokenInstance.withdrawOldToken(owner, 250, {from: swapOwner})

            swappedBalance = await oldTokenInstance.balanceOf(swapTokenInstance.address)
            assert.equal(swappedBalance.valueOf(), 0)
            ownerBalance = await oldTokenInstance.balanceOf.call(owner)

            assert.equal(ownerBalance.valueOf(), SUPPLY_AMOUNT - 100)
            if (DEBUG_MODE) console.log('\tFINAL ---> ', 'swappedBalance =', swappedBalance.valueOf(), '|', 'ownerBalance =', ownerBalance.valueOf())
        })
    })
})
