pragma solidity ^0.4.24;
/**
    LOCKABLE TOKEN
    @author info@yggdrash.io
*/
contract Lockable {
    uint public creationTime;
    bool public tokenTransfer;
    address public owner;

    // WhiteList : They can transfer Token in disable
    mapping( address => bool ) public unlockaddress;
    // BlackList : They did not transfer Token in enable
    mapping( address => bool ) public lockaddress;

    // LOCK EVENT : add or remove blacklist
    event Locked(address lockaddress,bool status);
    // UNLOCK EVENT : add or remove whitelist
    event Unlocked(address unlockedaddress, bool status);


    // whitelist wallet is able to token transfer in disable token transfer
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
        creationTime = now;
        tokenTransfer = false;
        owner = msg.sender;
    }

    // Lock Address : add or remove blacklist
    function lockAddress(address target, bool status)
    external
    isOwner
    {
        require(owner != target);
        lockaddress[target] = status;
        emit Locked(target, status);
    }

    // UnLock Address : add or remove whitelist
    function unlockAddress(address target, bool status)
    external
    isOwner
    {
        unlockaddress[target] = status;
        emit Unlocked(target, status);
    }
}