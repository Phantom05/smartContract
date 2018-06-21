pragma solidity ^0.4.11;
import "../token/Erc20.sol";
import "../util/SafeMath.sol";

contract  SwapToken{
    using SafeMath for uint;
    ERC20 public oldToken;
    ERC20 public newToken;
    address public tokenOwner;

    address public owner;
    bool public swap_able;
    event Swap(address sender, uint amount);
    event SwapAble(bool swapable);

    modifier isOwner() {
        // Only owner is allowed to proceed
        require (msg.sender == owner);
        _;
    }

    // Check SwapAble
    modifier isSwap() {
        require (swap_able);
        _;
    }

    // init Contract
    function SwapToken()
    public
    {
        owner = msg.sender;
        swap_able = false;
    }

    // Setup Token Setup
    function tokenSetup(address _oldToken, address _newToken, address _tokenOwner)
    public
    isOwner
    {
        require(_oldToken != 0 && _newToken != 0 && _tokenOwner != 0);
        oldToken = ERC20(_oldToken);
        newToken = ERC20(_newToken);
        tokenOwner = _tokenOwner;
    }

    // swap start, stop
    function swapAble(bool _swap_able)
    public
    isOwner
    {
        swap_able = _swap_able;
        SwapAble(_swap_able);
    }

    // withdraw old token
    function withdrawOldToken(address to, uint amount)
    public
    isOwner
    returns (bool success)
    {
        require(oldToken.transfer(to, amount));
        return true;
    }

    function swapAbleToken()
    public
    constant
    returns (uint256)
    {
        return newToken.allowance(tokenOwner, this);
    }

    function swapToken(uint amount)
    public
    isSwap
    returns (bool success)
    {
        // check allowance newToken
        require(newToken.allowance(tokenOwner, this) >= amount);
        // getBack Token
        require(oldToken.transferFrom(msg.sender, this, amount));
        // swap new Token
        require(newToken.transferFrom(tokenOwner, msg.sender, amount));
        Swap(msg.sender, amount);
        return true;
    }

    /* This unnamed function is called whenever someone tries to send ether to it */
    function () public payable {
        revert();
    }
}