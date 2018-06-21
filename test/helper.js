// https://github.com/trufflesuite/truffle/issues/498
exports.expectThrow = async (promise) => {
    try {
        await promise
    } catch (err) {
        return
    }

    assert(false, 'Expected throw not received')
}