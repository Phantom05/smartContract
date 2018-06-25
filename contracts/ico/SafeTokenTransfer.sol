pragma solidity ^0.4.24;
import "../token/Erc20.sol";
import "../util/SafeMath.sol";

contract SafeTokenTransfer {
    using SafeMath for uint256;
    ERC20 public yeedToken;
    address public tokenOwner;
    address public owner;
    event TransferToken(address sender, uint256 amount);


    modifier isOwner() {
        // Only owner is allowed to proceed
        require (msg.sender == owner);
        _;
    }

    // init Contract
    constructor()
    public
    {
        owner = msg.sender;
    }

    // setupToken
    function setupToken(address _token, address _tokenOwner)
    public
    isOwner
    {
        require(_token != 0);
        yeedToken = ERC20(_token);
        tokenOwner = _tokenOwner;
    }

    function transferToken(address receiver, uint256 tokens)
    public
    isOwner
    {
        // check token balance
        require(yeedToken.balanceOf(receiver) < tokens);
        tokens = tokens.sub(yeedToken.balanceOf(receiver));
        // Send token
        require(yeedToken.transferFrom(tokenOwner, receiver, tokens));
        emit TransferToken(receiver, tokens);
    }

}
