const YeedToken = artifacts.require("./YeedToken.sol")
const { expectThrow } = require('./helper') 

describe('# YeedToken Function...', () => {
    let instance

    before(async () => {
        instance = await YeedToken.deployed()
    })

    contract('setAdminMode(boolean) - 관리모드 변경 테스트', accounts => {
        let ownerAccount = accounts[0]
        let aliceAccount = accounts[1]

        it('일반계정은 관리모드를 변경할 수 없다', async () => {
            let isAdminMode = await instance.adminMode()
            assert.isFalse(isAdminMode)

            let tx = instance.setAdminMode(true, {from: aliceAccount})
            expectThrow(tx)
            
            isAdminMode = await instance.adminMode()
            assert.isFalse(isAdminMode)
        })

        it('관리계정은 관리모드를 변경할 수 있다', async () => {
            let isAdminMode = await instance.adminMode()
            assert.isFalse(isAdminMode)

            await instance.setAdminMode(true, {from: ownerAccount})
            
            isAdminMode = await instance.adminMode()
            assert.isTrue(isAdminMode)
        })
    })

    contract('setTokenTransfer(boolean) - 거래모드 변경 테스트', accounts => {
        let ownerAccount = accounts[0]
        let aliceAccount = accounts[1]

        it('관리모드가 꺼져있을 때, 모든 계정은 거래모드를 변경할 수 없다', async () => {
            let isAdminMode = await instance.adminMode()
            assert.isFalse(isAdminMode)
            let isTokenTransfer = await instance.tokenTransfer()
            assert.isFalse(isTokenTransfer)

            let tx = instance.setTokenTransfer(true, {from: ownerAccount})
            expectThrow(tx)

            tx = instance.setTokenTransfer(true, {from: aliceAccount})
            expectThrow(tx)
            
            isTokenTransfer = await instance.tokenTransfer()
            assert.isFalse(isTokenTransfer)
        })

        it('관리모드가 켜져있을 때, 일반 계정은 거래모드를 변경할 수 없다', async () => {
            await instance.setAdminMode(true, {from: ownerAccount})
            let isAdminMode = await instance.adminMode()
            assert.isTrue(isAdminMode)

            let tx = instance.setTokenTransfer(true, {from: aliceAccount})
            expectThrow(tx)
            
            isTokenTransfer = await instance.tokenTransfer()
            assert.isFalse(isTokenTransfer)
        })

        it('관리모드가 켜져있을 때, 관리 계정은 거래모드를 변경할 수 있다', async () => {
            let isAdminMode = await instance.adminMode()
            assert.isTrue(isAdminMode)

            let tx = instance.setTokenTransfer(true, {from: ownerAccount})
            
            isTokenTransfer = await instance.tokenTransfer()
            assert.isTrue(isTokenTransfer)
        })
    })

    contract('setLockAddress(string, boolean) - 블랙리스트 동작 테스트', accounts => {
        let ownerAccount = accounts[0]
        let aliceAccount = accounts[1]
        let bobAccount = accounts[2]

        it('일반계정이 다른 계정을 블랙리스트에 추가 불가', async () => {
            let tx = instance.setLockAddress(bobAccount, true, {from: aliceAccount})
            expectThrow(tx)
        })

        it('일반계정이 자기 자신을 블랙리스트에 추가 불가', async () => {
            let tx = instance.setLockAddress(aliceAccount, true, {from: aliceAccount})
            expectThrow(tx)
        })

        it('관리계정이 다른 계정을 블랙리스트에 추가 가능', async () => {
            let isLock = await instance.lockAddress(aliceAccount)
            assert.isFalse(isLock)

            await instance.setLockAddress(aliceAccount, true, {from: ownerAccount})
            
            isLock = await instance.lockAddress(aliceAccount)
            assert.isTrue(isLock)
        })

        it('관리계정이 자기 자신을 블랙리스트에 추가 불가', async () => {
            let tx = instance.setLockAddress(ownerAccount, true, {from: ownerAccount})
            expectThrow(tx)
        })

        it('블랙계정이 블랙리스트를 조회 가능', async () => {
            let isLock = await instance.lockAddress(aliceAccount, {from: aliceAccount})
            assert.isTrue(isLock)
        })
    })

    contract('setUnlockAddress(string, boolean) - 화이트리스트 동작 테스트', accounts => {
        let ownerAccount = accounts[0]
        let aliceAccount = accounts[1]
        let bobAccount = accounts[2]

        it('일반계정이 다른 계정을 화이트리스트에 추가 불가', async () => {
            let tx = instance.setUnlockAddress(bobAccount, true, {from: aliceAccount})
            expectThrow(tx)
        })

        it('일반계정이 자기 자신을 화이트리스트에 추가 불가', async () => {
            let tx = instance.setUnlockAddress(aliceAccount, true, {from: aliceAccount})
            expectThrow(tx)
        })

        it('관리계정이 다른 계정을 화이트리스트에 추가 가능', async () => {
            let isUnlock = await instance.unlockAddress(aliceAccount)
            assert.isFalse(isUnlock)

            await instance.setUnlockAddress(aliceAccount, true, {from: ownerAccount})
            
            isUnlock = await instance.unlockAddress(aliceAccount)
            assert.isTrue(isUnlock)
        })

        it('관리계정이 자기 자신을 화이트리스트에 추가 가능', async () => {
            let isUnlock = await instance.unlockAddress(ownerAccount)
            assert.isFalse(isUnlock)

            await instance.setUnlockAddress(ownerAccount, true, {from: ownerAccount})
            isUnlock = await instance.unlockAddress(ownerAccount)
            assert.isTrue(isUnlock)
        })
    })

    contract('transfer(string, uint256) - 토큰 전송 테스트', accounts => {
        let ownerAccount = accounts[0]
        let aliceAccount = accounts[1]
        let bobAccount = accounts[2]

        before('alice, bob 에게 1000 yeed 씩 분배', async () => {
            let amount = 1000
            await instance.setAdminMode(true)
            await instance.setTokenTransfer(true)
            await instance.transfer(aliceAccount, amount, {from: ownerAccount})
            await instance.transfer(bobAccount, amount, {from: ownerAccount})
            let balance = await instance.balanceOf(aliceAccount)
            let aliceInitialBalance = balance.toNumber()
            balance = await instance.balanceOf(bobAccount)
            let bobInitialBalance = balance.toNumber()

            assert.equal(aliceInitialBalance, 1000)
            assert.equal(bobInitialBalance, 1000)
            await instance.setTokenTransfer(false)
            await instance.setAdminMode(false)
        })

        describe('거래모드가 꺼져있을 때', () => {
            before(async () => {
                let isTokenTransfer = await instance.tokenTransfer()
                assert.isFalse(isTokenTransfer)
            })

            it('관리계정은 토큰을 전송할 수 없다.', async () => {
                let tx = instance.transfer(bobAccount, 100, {from: ownerAccount})
                expectThrow(tx)
            })

            it('일반계정은 토큰을 전송할 수 없다.', async () => {
                let tx = instance.transfer(bobAccount, 100, {from: aliceAccount})
                expectThrow(tx)
            })

            it('화이트리스트에 등록된 계정은 토큰을 전송할 수 있다.', async () => {
                await instance.setUnlockAddress(aliceAccount, true)
                let isWhite = await instance.unlockAddress(aliceAccount)
                assert.isTrue(isWhite)

                let amount = 100
                let balance = await instance.balanceOf(aliceAccount)
                let aliceStartingBalacne = balance.toNumber()
                balance = await instance.balanceOf(bobAccount)
                let bobStartingBalacne = balance.toNumber()

                await instance.transfer(bobAccount, amount, {from: aliceAccount})

                balance = await instance.balanceOf(aliceAccount)
                let aliceEndingBalacne = balance.toNumber()
                balance = await instance.balanceOf(bobAccount)
                let bobEndingBalacne = balance.toNumber()

                assert.equal(aliceEndingBalacne, aliceStartingBalacne - amount)
                assert.equal(bobEndingBalacne, bobStartingBalacne + amount)
            })
        })

        describe('거래모드가 켜져있을 때', () => {
            before(async () => {
                await instance.setAdminMode(true)
                await instance.setTokenTransfer(true)
                let isTokenTransfer = await instance.tokenTransfer()
                assert.isTrue(isTokenTransfer)
            })

            it('관리계정은 토큰을 전송할 수 있다', async () => {
                let amount = 100
                let balance = await instance.balanceOf(ownerAccount)
                let ownerStartingBalacne = balance.toNumber()
                balance = await instance.balanceOf(bobAccount)
                let bobStartingBalacne = balance.toNumber()

                await instance.transfer(bobAccount, amount, {from: ownerAccount})

                balance = await instance.balanceOf(ownerAccount)
                let ownerEndingBalacne = balance.toNumber()
                balance = await instance.balanceOf(bobAccount)
                let bobEndingBalacne = balance.toNumber()

                assert.equal(ownerEndingBalacne, ownerStartingBalacne - amount)
                assert.equal(bobEndingBalacne, bobStartingBalacne + amount)
            })

            it('일반계정은 토큰을 전송할 수 있다', async () => {
                let amount = 100
                let balance = await instance.balanceOf(aliceAccount)
                let aliceStartingBalacne = balance.toNumber()
                balance = await instance.balanceOf(bobAccount)
                let bobStartingBalacne = balance.toNumber()

                await instance.transfer(bobAccount, amount, {from: aliceAccount})

                balance = await instance.balanceOf(aliceAccount)
                let aliceEndingBalacne = balance.toNumber()
                balance = await instance.balanceOf(bobAccount)
                let bobEndingBalacne = balance.toNumber()

                assert.equal(aliceEndingBalacne, aliceStartingBalacne - amount)
                assert.equal(bobEndingBalacne, bobStartingBalacne + amount)
            })

            it('화이트리스트에 등록된 계정은 토큰을 전송할 수 있다', async () => {
                let isWhite = await instance.unlockAddress(aliceAccount)
                assert.isTrue(isWhite)

                let amount = 100
                let balance = await instance.balanceOf(aliceAccount)
                let aliceStartingBalacne = balance.toNumber()
                balance = await instance.balanceOf(bobAccount)
                let bobStartingBalacne = balance.toNumber()

                await instance.transfer(bobAccount, amount, {from: aliceAccount})

                balance = await instance.balanceOf(aliceAccount)
                let aliceEndingBalacne = balance.toNumber()
                balance = await instance.balanceOf(bobAccount)
                let bobEndingBalacne = balance.toNumber()

                assert.equal(aliceEndingBalacne, aliceStartingBalacne - amount)
                assert.equal(bobEndingBalacne, bobStartingBalacne + amount)
            })

            it('블랙리스트에 등록된 계정은 토큰을 전송할 수 없다', async () => {
                let amount = 100
                await instance.setLockAddress(bobAccount, true)
                let isBlack = await instance.lockAddress(bobAccount)
                assert.isTrue(isBlack)

                let tx = instance.transfer(aliceAccount, amount, {from: bobAccount})
                expectThrow(tx)
            })
        })
    })

    contract('burnTokens(uint256 tokensAmount)', accounts => {
        let ownerAccount = accounts[0]
        let aliceAccount = accounts[1]

        before('alice 에게 1000 yeed 분배', async () => {
            let amount = 1000
            await instance.setAdminMode(true)
            await instance.setTokenTransfer(true)
            await instance.transfer(aliceAccount, amount, {from: ownerAccount})
            let balance = await instance.balanceOf(aliceAccount)
            let aliceInitialBalance = balance.toNumber()
            assert.equal(aliceInitialBalance, 1000)
            await instance.setTokenTransfer(false)
            await instance.setAdminMode(false)
        })

        describe('어드민모드가 꺼져있을 때', () => {
            it('모든계정은 자신의 토큰을 태울 수 없다.', async () => {
                let isAdminMode = await instance.adminMode()
                assert.isFalse(isAdminMode)

                let amount = 10
                let tx = instance.burnTokens(amount, {from: ownerAccount})
                expectThrow(tx)

                tx = instance.burnTokens(amount, {from: aliceAccount})
                expectThrow(tx)
            })
        })

        describe('어드민모드가 켜져있을 때', () => {
            before('어드민 모드 온', async () => {
                await instance.setAdminMode(true)
                let isAdminMode = await instance.adminMode()
                assert.isTrue(isAdminMode)
            })

            it('관리계정은 자신의 토큰을 태울 수 있다.', async () => {
                let amount = 10
                let balance = await instance.balanceOf(ownerAccount)
                let startingBalance = balance.toNumber()
                balance = await instance.totalSupply()
                let startingTotalSupply = balance.toNumber()

                await instance.burnTokens(amount, {from: ownerAccount})
                
                balance = await instance.balanceOf(ownerAccount)
                let endinBalance = balance.toNumber()
                balance = await instance.totalSupply()
                let endingTotalSupply = balance.toNumber()

                assert.equal(endinBalance, startingBalance - amount)
                assert.equal(endingTotalSupply, startingTotalSupply - amount)
            })

            it('일반계정은 자신의 토큰을 태울 수 없다.', async () => {
                let amount = 10

                tx = instance.burnTokens(amount, {from: aliceAccount})
                expectThrow(tx)
            })

            it('관리계정은 자신이 가진 것보다 많은 토큰을 태울 수 없다.', async () => {
                let balance = await instance.balanceOf(ownerAccount)
                let startingBalance = balance.toNumber()
                let amount = startingBalance + 1

                let tx = instance.burnTokens(amount, {from: ownerAccount})
                expectThrow(tx)
            })
        })
    })

    // approve() test 는 yeedtokenScenario.test.js - 3-3 ~ 3-7 참조
    contract.only('increase/decrease approve(address spender, uint256 value)', accounts => {
        let ownerAccount = accounts[0]
        let aliceAccount = accounts[1]
        let bobAccount = accounts[2]

        before('alice, bob 에게 1000 yeed 씩 분배', async () => {
            let amount = 1000
            await instance.setAdminMode(true)
            await instance.setTokenTransfer(true)
            await instance.transfer(aliceAccount, amount, {from: ownerAccount})
            await instance.transfer(bobAccount, amount, {from: ownerAccount})
            let balance = await instance.balanceOf(aliceAccount)
            let aliceInitialBalance = balance.toNumber()
            balance = await instance.balanceOf(bobAccount)
            let bobInitialBalance = balance.toNumber()

            assert.equal(aliceInitialBalance, 1000)
            assert.equal(bobInitialBalance, 1000)
            await instance.setTokenTransfer(false)
            await instance.setAdminMode(false)
        })

        it('일반계정은 자신이 가진 토큰보다 많은 수량을 다른 계정에 허용할 수 있다.', async () => {
            let amount = 2000
            let balance = await instance.balanceOf(aliceAccount)
            let alice_balance = balance.toNumber()
            let approveAmount = alice_balance + amount
            await instance.increaseApproval(bobAccount, approveAmount, {from: aliceAccount})
            let allowedAmount = await instance.allowance(aliceAccount, bobAccount)
            assert.equal(allowedAmount, approveAmount)
        })

        it('토큰을 허용 받은 계정이 상대가 가진 토큰보다 많은 수량을 사용할 수 없다.', async () => {
            await instance.setAdminMode(true)
            await instance.setTokenTransfer(true)
            let isTokenTransfer = await instance.tokenTransfer()
            assert.isTrue(isTokenTransfer)

            let tx = instance.transferFrom(aliceAccount, bobAccount, 1001)
            expectThrow(tx)
        })

        it('일반계정은 다른 계정에게 허용한 토큰의 수량을 감소할 수 있다.', async () => {
            let allowedAmount = await instance.allowance(aliceAccount, bobAccount)
            let startingAllowedAmountFromAlice = allowedAmount.toNumber()
            let decreaseApproveAmount = 100
            await instance.decreaseApproval(bobAccount, decreaseApproveAmount, {from: aliceAccount})
            allowedAmount = await instance.allowance(aliceAccount, bobAccount)
            let endingAllowedAmountFromAlice = allowedAmount.toNumber()
            assert.equal(endingAllowedAmountFromAlice, startingAllowedAmountFromAlice - decreaseApproveAmount)
        })

        it('일반계정이 다른 계정에게 허용한 토큰보다 많은 수량을 감소하면 허용 토큰이 0 이 된다.', async () => {
            let allowedAmount = await instance.allowance(aliceAccount, bobAccount)
            let startingAllowedAmountFromAlice = allowedAmount.toNumber()
            let decreaseApproveAmount = startingAllowedAmountFromAlice + 10000
            await instance.decreaseApproval(bobAccount, decreaseApproveAmount, {from: aliceAccount})
            allowedAmount = await instance.allowance(aliceAccount, bobAccount)
            let endingAllowedAmountFromAlice = allowedAmount.toNumber()
            assert.equal(endingAllowedAmountFromAlice, 0)
        })

        // AdminMode On
        it('잠긴계정은 허용 토큰을 증가할 수 없다.', async () => {
            let amount = 100
            await instance.setLockAddress(aliceAccount, true)
            let tx = instance.increaseApproval(bobAccount, amount, {from: aliceAccount})
            expectThrow(tx)
        })

        it('잠긴계정은 허용 토큰을 감소할 수 없다.', async () => {
            let amount = 100
            let isLock = await instance.lockAddress(aliceAccount)
            assert.isTrue(isLock)

            let tx = instance.decreaseApproval(bobAccount, amount, {from: aliceAccount})
            expectThrow(tx)
        })
    })
})