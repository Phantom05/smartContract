pragma solidity ^0.4.11;
import "./Erc20.sol";
import "./Lockable.sol";
import '../util/SafeMath.sol';

/**
    YGGDRASH Token
    @author DongOk Peter Ryu - <odin@yggdrash.io>
*/
contract YeedToken is ERC20, Lockable {

    // ADD INFORMATION
    string public constant name = "YGGDRASH";
    string public constant symbol = "YEED";
    uint8 public constant decimals = 18;  // 18 is the most common number of decimal places

    using SafeMath for uint;

    mapping( address => uint ) _balances;
    mapping( address => mapping( address => uint ) ) _approvals;
    uint _supply;

    event TokenBurned(address burnAddress, uint amountOfTokens);
    event TokenTransfer();

    function YeedToken( uint initial_balance, address wallet)
    public
    {
        require(wallet != 0);
        require(initial_balance != 0);
        _balances[msg.sender] = initial_balance;
        _supply = initial_balance;
    }

    function totalSupply() public constant returns (uint supply) {
        return _supply;
    }

    function balanceOf( address who ) public constant returns (uint value) {
        return _balances[who];
    }

    function allowance(address owner, address spender) public constant returns (uint _allowance) {
        return _approvals[owner][spender];
    }

    function transfer( address to, uint value)
    public
    isTokenTransfer
    checkLock
    returns (bool success) {

        require( _balances[msg.sender] >= value );

        _balances[msg.sender] = _balances[msg.sender].sub(value);
        _balances[to] = _balances[to].add(value);
        Transfer( msg.sender, to, value );
        return true;
    }

    function transferFrom( address from, address to, uint value)
    public
    isTokenTransfer
    checkLock
    returns (bool success) {
        // if you don't have enough balance, throw
        require( _balances[from] >= value );
        // if you don't have approval, throw
        require( _approvals[from][msg.sender] >= value );
        // transfer and return true
        _approvals[from][msg.sender] = _approvals[from][msg.sender].sub(value);
        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        Transfer( from, to, value );
        return true;
    }

    function approve(address spender, uint value)
    public
    checkLock
    returns (bool success) {
        _approvals[msg.sender][spender] = value;
        Approval( msg.sender, spender, value );
        return true;
    }

    // burnToken burn tokensAmount for sender balance
    function burnTokens(uint tokensAmount)
    public
    isTokenTransfer
    {
        require( _balances[msg.sender] >= tokensAmount );

        _balances[msg.sender] = _balances[msg.sender].sub(tokensAmount);
        _supply = _supply.sub(tokensAmount);
        TokenBurned(msg.sender, tokensAmount);

    }


    function enableTokenTransfer()
    external
    isOwner
    {
        tokenTransfer = true;
        TokenTransfer();
    }

    function disableTokenTransfer()
    external
    isOwner
    {
        tokenTransfer = false;
        TokenTransfer();
    }

    /* This unnamed function is called whenever someone tries to send ether to it */
    function () public payable {
        revert();
    }

}