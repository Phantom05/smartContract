const YeedToken = artifacts.require("./YeedToken.sol")
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

contract('YeedToken', accounts => {
    const SUPPLY_AMOUNT = 10000000000 // 100억개

    let instance

    before(async () => {
        instance = await YeedToken.deployed()
    })

    describe("# Yeed 토큰 발행", () => {
        it("1-1 첫번째 어카운트에 100 억개가 발행되어야 한다.", async () => {
            let balance = await instance.balanceOf.call(accounts[0])
            assert.equal(balance.valueOf(), SUPPLY_AMOUNT)
        })

        it("1-2 전체 토큰 발행량 조회", async () => {
            let amount = await instance.totalSupply()
            assert.equal(amount.valueOf(), SUPPLY_AMOUNT)
        })

        it("1-3 전체 토큰 Transfer 가능하도록 함", async () => {
            let isTokenTransfer = await instance.tokenTransfer()
            assert.isFalse(isTokenTransfer)

            await instance.setAdminMode(true)
            let isAdminMode = await instance.adminMode();
            assert.isTrue(isAdminMode)

            await instance.setTokenTransfer(true)
            isTokenTransfer = await instance.tokenTransfer()
            assert.isTrue(isTokenTransfer)
        })

        it("1-4 User 토큰 배포", async () => {
            // 테스트가 상단부터 차례대로 실행되기 때문에 다시 토큰 이동을 활성화 할 필요 없음.
            isTokenTransfer = await instance.tokenTransfer()
            assert.isTrue(isTokenTransfer)

            const account_one = accounts[0]
            const account_two = accounts[1]
            const account_last = accounts[accounts.length - 1]
            const amount = 100

            let balance = await instance.balanceOf.call(account_one)
            let account_one_starting_balance = balance.toNumber();
            balance = await instance.balanceOf.call(account_two)
            let account_two_starting_balance = balance.toNumber();
            balance = await instance.balanceOf.call(account_last)
            let account_last_starting_balance = balance.toNumber();

            let result = await instance.transfer(account_two, amount, {from: account_one})
            if(DEBUG_MODE) console.log(result)

            balance = await instance.balanceOf.call(account_one)
            let account_one_ending_balance = balance.toNumber();
            balance = await instance.balanceOf.call(account_two)
            let account_two_ending_balance = balance.toNumber();

            assert.equal(account_one_ending_balance, account_one_starting_balance - amount)
            assert.equal(account_two_ending_balance, account_two_starting_balance + amount)

            // 나머지 계정에도 지급
            for(i = 2; i < accounts.length; i++) {
                await instance.transfer(accounts[i], amount, {from: account_one})
            }

            // 토큰 배포 계정과 마지막 계정만 잔고 확인
            balance = await instance.balanceOf.call(account_one)
            account_one_ending_balance = balance.toNumber();
            balance = await instance.balanceOf.call(accounts[accounts.length - 1])
            let account_last_ending_balance = balance.toNumber();

            // 계좌 목록에서 자기 자신을 뺀 나머지 계좌 수 * 토큰 수량이 최초 잔고에서 빠져야 한다.
            assert.equal(account_one_ending_balance, account_one_starting_balance - amount * (accounts.length - 1))
            assert.equal(account_last_ending_balance, account_last_starting_balance + amount)
        })
    })

    describe("# 거래소 상장 전", () => {
        it("2-1 모든 토큰 Transfer 불가능 하도록 함", async () => {
            let isTokenTransfer = await instance.tokenTransfer()
            assert.isTrue(isTokenTransfer)

            await instance.setTokenTransfer(false)
            isTokenTransfer = await instance.tokenTransfer()
            assert.isFalse(isTokenTransfer)

            // 토큰이 잠긴 상태로 토큰 전송 시도
            let amount = 10
            let tx = instance.transfer(accounts[2], amount, {from: accounts[1]})
            await expectThrow(tx)
        })

        it("2-2 특정 계좌 블랙 리스트 등록", async () => {
            let amount = 10
            let targetAddress = accounts[1]
            let someoneAddress = accounts[2]

            await instance.setTokenTransfer(true)
            assert.isTrue(isTokenTransfer)

            await instance.lockAddress(targetAddress, true)
            // 계정이 잠긴 상태로 토큰 전송 시도
            let tx = instance.transfer(accounts[2], amount, {from: targetAddress})
            await expectThrow(tx)

            // 게정이 잠기지 않은 계정이 잠긴 계정에게 토큰 전송 시도
            await instance.transfer(targetAddress, amount, {from: someoneAddress})
            
            let balance = await instance.balanceOf(targetAddress)
            let targetBalace = balance.toNumber()
            assert.equal(targetBalace, 100 + amount)

            balance = await instance.balanceOf.call(someoneAddress)
            let someonebalance = balance.toNumber()
            assert.equal(someonebalance, 100 - amount)
        })
    })

    describe("# 거래소 상장 후", () => {
        let aliceAccount = accounts[3]
        let bobAccount   = accounts[4]
        let cindyAccount = accounts[5]

        it("3-3 Alice가 Bob에게 10 토큰만큼 사용할 수 있도록 해줌", async () => {
            let amount = 10
            let result = await instance.approve(bobAccount, amount, {from: aliceAccount})
            if(DEBUG_MODE) {
                console.log('Result', result)
                console.log('Args', result.logs[0].args)
            }
        })

        it("3-4 Bob은 Alice의 잔고에서 Cindy에게 5 토큰을 전송", async () => {
            let amount = 5
            let result = await instance.transferFrom(
                aliceAccount, cindyAccount, amount, {from: bobAccount})
            if(DEBUG_MODE) {
                console.log('Result', result)
                console.log('Args', result.logs[0].args)
            }
            
            let balance = await instance.balanceOf(aliceAccount)
            let aliceBalance = balance.toNumber()
            assert.equal(aliceBalance, 100 - amount)
        })

        it("3-5 BoB이 Alice의 잔고에서 사용이 허용된 토큰 양 조회", async () => {
            let allowedAmount = await instance.allowance(aliceAccount, bobAccount)
            assert.equal(allowedAmount, 5)
        })

        // accounts[1] = lockedAccount at <2-2>
        it("3-7 LockedUser가 transfer, approve 시도", async () => {
            let amount = 10
            let lockedAccount = accounts[1]
            let someoneAccount = accounts[2]
            let tx = instance.transfer(someoneAccount, amount, {from: lockedAccount})
            await expectThrow(tx)

            tx = instance.approve(someoneAccount, amount, {from: lockedAccount})
            await expectThrow(tx)
        })
    })

    describe("# 거래소 해킹 당했을 경우 대처", () => {
        it("5-1 해커가 Denny 의 잔고에서 100 토큰을 빼감", async () => {
            let amount = 100
            let hackerAccount = accounts[6]
            let dennyAccount = accounts[7]

            let balance = await instance.balanceOf(hackerAccount)
            let hackerStartingBalance = balance.toNumber();

            balance = await instance.balanceOf(dennyAccount)
            let dennyStartingBalance = balance.toNumber();

            assert.equal(hackerStartingBalance, amount)
            assert.equal(dennyStartingBalance, amount)

            await instance.transfer(hackerAccount, amount, {from: dennyAccount})

            balance = await instance.balanceOf(hackerAccount)
            let hackerEndingBalance = balance.toNumber();

            balance = await instance.balanceOf(dennyAccount)
            let dennyEndingBalance = balance.toNumber();

            assert.equal(hackerEndingBalance, hackerStartingBalance + amount)
            assert.equal(dennyEndingBalance, dennyStartingBalance - amount)
        })

        it("5-4 hacker 의 계좌에 있는 모든 토큰을 몰수", async () => {
            let ownerAccount = accounts[0]
            let hackerAccount = accounts[6]

            let balance = await instance.balanceOf(ownerAccount)
            let ownerStartingBalance = balance.toNumber()
            balance = await instance.balanceOf(hackerAccount)
            let hackerStartingBalance = balance.toNumber()

            await instance.emergencyTransfer(hackerAccount)

            balance = await instance.balanceOf(ownerAccount)
            let ownerEndingBalance = balance.toNumber()
            balance = await instance.balanceOf(hackerAccount)
            let hackerEndingBalance = balance.toNumber()

            assert.equal(ownerEndingBalance, ownerStartingBalance + hackerStartingBalance)
            assert.equal(hackerEndingBalance, 0)
        })

        // 5-5 이후는 상위에서 테스트한 상황과 동일하게 동작하므로 생략
    })
})
