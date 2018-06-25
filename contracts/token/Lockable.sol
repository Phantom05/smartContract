pragma solidity ^0.4.24;

/// LOCKABLE TOKEN
/// @author info@yggdrash.io
/// version 1.0.1
/// date 06/22/2018

contract Lockable {
    bool public tokenTransfer;
    address public owner;

    // unlockaddress(whitelist) : They can transfer even if tokenTranser flag is false.
    mapping( address => bool ) public unlockaddress;
    // lockaddress(blacklist) : They cannot transfer even if tokenTransfer flag is true.
    mapping( address => bool ) public lockaddress;

    // LOCK EVENT : add or remove blacklist
    event Locked(address lockaddress,bool status);
    // UNLOCK EVENT : add or remove whitelist
    event Unlocked(address unlockedaddress, bool status);


    // check whether can tranfer tokens or not.
    modifier isTokenTransfer {
        // if token transfer is not allow
        if(!tokenTransfer) {
            require(unlockaddress[msg.sender]);
        }
        _;
    }

    // check whether registered in lockaddress or not
    modifier checkLock {
        require(!lockaddress[msg.sender]);
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

    // add or remove in lockaddress(blacklist)
    function lockAddress(address target, bool status)
    external
    isOwner
    {
        require(owner != target);
        lockaddress[target] = status;
        emit Locked(target, status);
    }

    // add or remove in unlockaddress(whitelist)
    function unlockAddress(address target, bool status)
    external
    isOwner
    {
        unlockaddress[target] = status;
        emit Unlocked(target, status);
    }
}