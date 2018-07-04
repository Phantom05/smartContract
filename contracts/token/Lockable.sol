pragma solidity 0.4.24;

/// LOCKABLE TOKEN
/// @author info@yggdrash.io
/// version 1.0.1
/// date 06/22/2018

contract Lockable {
    bool public tokenTransfer;
    address public owner;

    // unlockAddress(whitelist) : They can transfer even if tokenTranser flag is false.
    mapping(address => bool) public unlockAddress;
    // lockAddress(blacklist) : They cannot transfer even if tokenTransfer flag is true.
    mapping(address => bool) public lockAddress;

    // LOCK EVENT : add or remove blacklist
    event Locked(address lockAddress, bool status);
    // UNLOCK EVENT : add or remove whitelist
    event Unlocked(address unlockedAddress, bool status);


    // check whether can tranfer tokens or not.
    modifier isTokenTransfer {
        // if token transfer is not allow
        if(!tokenTransfer) {
            require(unlockAddress[msg.sender]);
        }
        _;
    }

    // check whether registered in lockAddress or not
    modifier checkLock {
        require(!lockAddress[msg.sender]);
        _;
    }

    modifier isOwner
    {
        require(owner == msg.sender);
        _;
    }

    constructor()
    public
    {
        tokenTransfer = false;
        owner = msg.sender;
    }

    // add or remove in lockAddress(blacklist)
    function setLockAddress(address target, bool status)
    external
    isOwner
    {
        require(owner != target);
        lockAddress[target] = status;
        emit Locked(target, status);
    }

    // add or remove in unlockAddress(whitelist)
    function setUnlockAddress(address target, bool status)
    external
    isOwner
    {
        unlockAddress[target] = status;
        emit Unlocked(target, status);
    }
}