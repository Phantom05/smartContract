pragma solidity ^0.4.11;
import "../token/Erc20.sol";
import "../util/SafeMath.sol";
/**
    YGGDRASH CROWD SALE SmartContract
    @author Peter Ryu - <odin@yggdrash.io>
*/
contract YggdrashCrowdSale {
    using SafeMath for uint;
    ERC20 public yeedToken;
    Stages stage;
    address public wallet;
    address public owner;
    address public tokenOwner;
    uint public saleAmount;    // sale Token amount
    uint public priceFactor; // ratio
    uint public startBlock;
    uint public totalReceived;
    uint public endTime;

    uint public maxValue; // max ETH
    uint public minValue;

    uint public maxGasPrice; // Max gasPrice

    // collect log
    event FundTransfer (address sender, uint amount);

    struct ContributeAddress {
        bool exists; // set to true
        address account; // sending account
        uint amount; // sending amount
        uint balance; // token value
        bytes data; // sending data
    }

    mapping(address => ContributeAddress) public _saleValue;
    mapping(bytes => ContributeAddress) _saleData;

    /*
        Check is owner address
    */
    modifier isOwner() {
        // Only owner is allowed to proceed
        require (msg.sender == owner);
        _;
    }

    /**
        Check Valid Payload
    */
    modifier isValidPayload() {
        // check Max
        if(maxValue != 0){
            require(msg.value < maxValue + 1);
        }
        // Check Min
        if(minValue != 0){
            require(msg.value > minValue - 1);
        }
        require(wallet != msg.sender);
        // check data value
        require(msg.data.length != 0);
        _;

    }

    /**
        NO MORE GAS WAR!!!
    */
    modifier checkGasPrice() {
        if(maxGasPrice != 0){
            assert(tx.gasprice < maxGasPrice + 1);
        }
        _;
    }

    /*
        Check exists sale list
    */
    modifier isExists() {
        require(_saleData[msg.data].exists == false);
        require(_saleValue[msg.sender].amount == 0);
        _;
    }

    /*
     *  Modifiers Stage
     */
    modifier atStage(Stages _stage) {
        require(stage == _stage);
        _;
    }


    /*
     *  Enums Stage Status
     */
    enum Stages {
    SaleDeployed,
    SaleSetUp,
    SaleStarted,
    SaleEnded
    }


    /// init
    /// @param _token token address
    /// @param _tokenOwner token owner wallet address
    /// @param _wallet sale ETH wallet
    /// @param _saleAmount sale token total value
    /// @param _priceFactor token and ETH ratio
    /// @param _maxValue maximum ETH balance
    /// @param _minValue minimum ETH balance

    function YggdrashCrowdSale(address _token, address _tokenOwner, address _wallet, uint _saleAmount, uint _priceFactor, uint _maxValue, uint _minValue)
    public
    {
        require (_tokenOwner != 0 && _wallet != 0 && _saleAmount != 0 && _priceFactor != 0);
        tokenOwner = _tokenOwner;
        owner = msg.sender;
        wallet = _wallet;
        saleAmount = _saleAmount;
        priceFactor = _priceFactor;
        maxValue = _maxValue;
        minValue = _minValue;
        stage = Stages.SaleDeployed;

        if(_token != 0){ // setup token
            yeedToken = ERC20(_token);
            stage = Stages.SaleSetUp;
        }
        // Max Gas Price is unlimited
        maxGasPrice = 0;
    }

    // setupToken
    function setupToken(address _token)
    public
    isOwner
    {
        require(_token != 0);
        yeedToken = ERC20(_token);
        stage = Stages.SaleSetUp;
    }

    /// @dev Start Sale
    function startSale()
    public
    isOwner
    atStage(Stages.SaleSetUp)
    {
        stage = Stages.SaleStarted;
        startBlock = block.number;
    }


    /**
        Contributer send to ETH
        Payload Check
        Exist Check
        GasPrice Check
        Stage Check
    */
    function()
    public
    isValidPayload
    isExists
    checkGasPrice
    atStage(Stages.SaleStarted)
    payable
    {
        uint amount = msg.value;
        uint maxAmount = saleAmount.div(priceFactor);
        // refund
        if (amount > maxAmount){
            uint refund = amount.sub(maxAmount);
            assert(msg.sender.send(refund));
            amount = maxAmount;
        }
        totalReceived = totalReceived.add(amount);
        // calculate token
        uint token = amount.mul(priceFactor);
        saleAmount = saleAmount.sub(token);

        // give token to sender
        yeedToken.transferFrom(tokenOwner, msg.sender, token);
        FundTransfer(msg.sender, token);

        // Set Contribute Account
        ContributeAddress crowdData = _saleValue[msg.sender];
        crowdData.exists = true;
        crowdData.account = msg.sender;
        crowdData.data = msg.data;
        crowdData.amount = amount;
        crowdData.balance = token;
        // add SaleData
        _saleData[msg.data] = crowdData;
        _saleValue[msg.sender] = crowdData;
        // send to wallet
        wallet.transfer(amount);

        // token sold out
        if (amount == maxAmount)
            finalizeSale();
    }

    /// @dev Changes auction saleAmount and start price factor before auction is started.
    /// @param _saleAmount Updated auction saleAmount.
    /// @param _priceFactor Updated start price factor.
    /// @param _maxValue Maximum balance of ETH
    /// @param _minValue Minimum balance of ETH
    function changeSettings(uint _saleAmount, uint _priceFactor, uint _maxValue, uint _minValue, uint _maxGasPrice)
    public
    isOwner
    {
        require(_saleAmount != 0 && _priceFactor != 0);
        saleAmount = _saleAmount;
        priceFactor = _priceFactor;
        maxValue = _maxValue;
        minValue = _minValue;
        maxGasPrice = _maxGasPrice;
    }
    /**
        Set Max Gas Price by Admin
    */
    function setMaxGasPrice(uint _maxGasPrice)
    public
    isOwner
    {
        maxGasPrice = _maxGasPrice;
    }


    // token balance
    // @param src sender wallet address
    function balanceOf(address src) public constant returns (uint256)
    {
        return _saleValue[src].balance;
    }

    // amount ETH value
    // @param src sender wallet address
    function amountOf(address src) public constant returns(uint256)
    {
        return _saleValue[src].amount;
    }

    // sale data
    // @param src Yggdrash uuid
    function saleData(bytes src) public constant returns(address)
    {
        return _saleData[src].account;
    }

    // Check sale is open
    function isSaleOpen() public constant returns (bool)
    {
        return stage == Stages.SaleStarted;
    }

    // CrowdSale halt
    function halt()
    public
    isOwner
    {
        finalizeSale();
    }

    // END of this sale
    function finalizeSale()
    private
    {
        stage = Stages.SaleEnded;
        // remain token send to owner
        saleAmount = 0;
        endTime = now;
    }
}
