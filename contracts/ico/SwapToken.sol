pragma solidity 0.4.24;
import "../token/ERC20.sol";
import "../util/SafeMath.sol";

/**
 * @title SwapToken
 */
contract  SwapToken{
    using SafeMath for uint256;
    ERC20 public oldToken;
    ERC20 public newToken;
    address public tokenOwner;

    address public owner;
    bool public swap_able;
    event Swap(address sender, uint256 amount);
    event SwapAble(bool swapable);

    modifier isOwner() {
        require (msg.sender == owner);
        _;
    }

    modifier isSwap() {
        require (swap_able);
        _;
    }

    constructor()
    public
    {
        owner = msg.sender;
        swap_able = false;
    }

    function setupToken(address _oldToken, address _newToken, address _tokenOwner)
    public
    isOwner
    {
        require(_oldToken != 0 && _newToken != 0 && _tokenOwner != 0);
        oldToken = ERC20(_oldToken);
        newToken = ERC20(_newToken);
        tokenOwner = _tokenOwner;
    }

    function swapAble(bool _swap_able)
    public
    isOwner
    {
        swap_able = _swap_able;
        emit SwapAble(_swap_able);
    }

    function withdrawOldToken(address to, uint256 amount)
    public
    isOwner
    returns (bool success)
    {
        require(oldToken.transfer(to, amount));
        return true;
    }

    function swapAbleToken()
    public
    view
    returns (uint256)
    {
        return newToken.allowance(tokenOwner, this);
    }

    function swapToken(uint256 amount)
    public
    isSwap
    returns (bool success)
    {
        require(newToken.allowance(tokenOwner, this) >= amount);
        require(oldToken.transferFrom(msg.sender, this, amount));
        require(newToken.transferFrom(tokenOwner, msg.sender, amount));
        emit Swap(msg.sender, amount);
        return true;
    }
}