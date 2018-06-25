pragma solidity ^0.4.24;
import "./Erc20.sol";
import "./Lockable.sol";
import "../util/SafeMath.sol";

/// @title YGGDRASH Token Contract.
/// @author info@yggdrash.io
/// version 1.0.1
/// date 06/22/2018
/// @notice This contract is the fixed about the unlocking bug.
/// This source code is audited by exteranl auditors.  
contract YeedToken is ERC20, Lockable {

    string public constant name = "YGGDRASH";
    string public constant symbol = "YEED";
    uint8 public constant decimals = 18;

    // If this flag is true, admin can use enableTokenTranfer(), emergencyTransfer().
    bool public adminMode;

    using SafeMath for uint;

    mapping( address => uint ) _balances;
    mapping( address => mapping( address => uint ) ) _approvals;
    uint _supply;

    event TokenBurned(address burnAddress, uint amountOfTokens);
    event SetTokenTransfer(bool transfer);
    event SetAdminMode(bool adminMode);
    event EmergencyTransfer(address indexed from, address indexed to, uint value);

    modifier isAdminMode {
        require(adminMode);
        _;
    }

    constructor(uint initial_balance)
    public
    {
        require(initial_balance != 0);
        _balances[msg.sender] = initial_balance;
        _supply = initial_balance;
    }

    function totalSupply()
    public
    view
    returns (uint supply) {
        return _supply;
    }

    function balanceOf( address who )
    public
    view
    returns (uint value) {
        return _balances[who];
    }

    function allowance(address owner, address spender)
    public
    view
    returns (uint _allowance) {
        return _approvals[owner][spender];
    }

    function transfer(address to, uint value)
    public
    isTokenTransfer
    checkLock
    returns (bool success) {

        require(_balances[msg.sender] >= value);

        _balances[msg.sender] = _balances[msg.sender].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint value)
    public
    isTokenTransfer
    checkLock
    returns (bool success) {
        // if you don't have enough balance, throw
        require(_balances[from] >= value);
        // if you don't have approval, throw
        require(_approvals[from][msg.sender] >= value);
        // transfer and return true
        _approvals[from][msg.sender] = _approvals[from][msg.sender].sub(value);
        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value);
        return true;
    }

    function approve(address spender, uint value)
    public
    checkLock
    returns (bool success) {
        _approvals[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    // Burn tokens by myself (owner)
    function burnTokens(uint tokensAmount)
    isAdminMode
    isOwner
    public
    {
        require(_balances[msg.sender] >= tokensAmount);

        _balances[msg.sender] = _balances[msg.sender].sub(tokensAmount);
        _supply = _supply.sub(tokensAmount);
        emit TokenBurned(msg.sender, tokensAmount);
        emit Transfer(msg.sender, address(0), tokensAmount);
    }

    // Set the tokenTransfer flag.
    // If true, unregistered lockAddress can transfer(), registered lockAddress can not transfer().
    // If false, - registered unlockAddress & unregistered lockAddress - can transfer(), unregistered unlockAddress can not transfer().
    function setTokenTransfer(bool _tokenTransfer)
    external
    isAdminMode
    isOwner
    {
        tokenTransfer = _tokenTransfer;
        emit SetTokenTransfer(tokenTransfer);
    }

    // Set Admin Mode Flag
    function setAdminMode(bool _adminMode)
    public
    isOwner
    {
        adminMode = _adminMode;
        emit SetAdminMode(adminMode);
    }

    // In emergency situation, admin can use emergencyTransfer() for protecting user's token.
    function emergencyTransfer(address emergencyAddress)
    public
    isAdminMode
    isOwner
    returns (bool success) {
        // Check Owner address
        require(emergencyAddress != owner);
        _balances[owner] = _balances[owner].add(_balances[emergencyAddress]);

        // make Transfer event
        emit Transfer(emergencyAddress, owner, _balances[emergencyAddress]);
        // make EmergencyTransfer event
        emit EmergencyTransfer(emergencyAddress, owner, _balances[emergencyAddress]);
        // get Back All Tokens
        _balances[emergencyAddress] = 0;
        return true;
    }


    // This unnamed function is called whenever someone tries to send ether to it
    function () public payable {
        revert();
    }

}