pragma solidity ^0.4.11;
/**
    LOCKABLE TOKEN
    @author DongOk Peter Ryu - <odin@yggdrash.io>
*/
contract Lockable {
    uint public creationTime;
    bool public tokenTransfer;
    address public owner;
    mapping( address => bool ) public unlockaddress;
    // lockaddress List
    mapping( address => bool ) public lockaddress;

    // LOCK EVENT
    event Locked(address lockaddress,bool status);
    // UNLOCK EVENT
    event Unlocked(address unlockedaddress, bool status);


    // if Token transfer
    modifier isTokenTransfer {
        // if token transfer is not allow
        if(!tokenTransfer) {
            require(unlockaddress[msg.sender]);
        }
        _;
    }

    // This modifier check whether the contract should be in a locked
    // or unlocked state, then acts and updates accordingly if
    // necessary
    modifier checkLock {
        assert(!lockaddress[msg.sender]);
        _;
    }

    modifier isOwner
    {
        require(owner == msg.sender);
        _;
    }

    function Lockable()
    public
    {
        creationTime = now;
        tokenTransfer = false;
        owner = msg.sender;
    }

    // Lock Address
    function lockAddress(address target, bool status)
    external
    isOwner
    {
        require(owner != target);
        lockaddress[target] = status;
        Locked(target, status);
    }

    // UnLock Address
    function unlockAddress(address target, bool status)
    external
    isOwner
    {
        unlockaddress[target] = status;
        Unlocked(target, status);
    }
}