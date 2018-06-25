pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/token/YeedToken.sol";

contract TestYeedToken {
    function testInitialBalanceWithNewYeedToken() public {
        YeedToken yeed = new YeedToken(10);

        uint256 expected = 10;

        Assert.equal(yeed.balanceOf(msg.sender), expected, "Owner should have 10 Yeed initially");
    }
}