// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * CHECK INTERFERENCES WITH OWNERS
 */

// import "./LiquidityUSDT.sol";
// import "./LiquidityExamples.sol";
import "./providers/uniswap/UniUsdcUsdtUsdcDai.sol";
import "./providers/uniswap/Swap.sol";
import "./providers/aaveV3.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "hardhat/console.sol";

// MIM TOKEN ADDRESS ARBITRUM: 0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A
// VAULT ADDRESS ARBITRUM: 0xDa2307A45D298e855415675bF388e2bd64351D5b
// STARTEGY ADDRESS ARBITRUM: 0x8156e45dDD85FF1e6D013D0AE3424bBE20596aC3
contract FijaStrategyTestPol is
    ReentrancyGuard
{
    //change: We do not need safeMath v.8
    using SafeMath for uint;

    address private constant DAI = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;
    address private constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address private constant USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
    address private constant WETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;
    address private constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    address private constant  WBTC = 0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6;

    // @dev events to get data from the Backend
    event InvestedStrategy(
        address indexed buyer,
        address indexed collateral,
        uint value
    );
    event WithdrawStrategy(address indexed seller, uint tokenId);
    //add the address of the tokens??
    event Compounding(uint amountAave, uint amounUni );

    bool public isOpen;
    uint costStrategy;
    address owner;

    // @dev Instances of the contracts that will enable investing in the DEFI protocols
    UniswapV3InteractionPol public Uniswap;
    AaveV3InteractionPol public AaveV3;
    Swap public swap;

    // address public UNI;
    // address public usdc;
    // address public usdt;
    // address public dai;

    //collaterals will be just stable coins so we can handle the same parameter at the pricing
    // struct Collateral {
    //     bool whitelisted;
    // }

    mapping(address => bool) public collaterals;
    mapping(address => uint) public amounInvested;
    mapping(address => bool) public whUser;
    mapping(address => bool) public resellers;
    mapping(bytes32 => uint) public identifiers;

    //tracks the amount of tokensets a user has bought in USDC/USDT 6 decimals

    modifier onlyOwner()  {
        require(msg.sender == owner);
        _;
    }

    modifier isReseller(){
        require(resellers[msg.sender] == true);
        _;
    }

    constructor(
        //PASS THE PARAMETER WITH 6 DECIMALS BECAUSE WE ALLOW PAYMETS WITH USDC/USDT
        //OR AMKE A MAPPING THAT TRACKS THE COST DEPENDIGN ON THE COLLATERAL
        uint strategyCost,
        // address USDCDAI,
        address _UniswapLiquidityContract, // address _uniContract,
        address _AAVE, // address _AAVEContract,
        address _SWAP
    ) {
        costStrategy = strategyCost;
        // UniswapUSDCDAI = LiquidityExamples(_UniswapLiquidityContract);
        Uniswap = UniswapV3InteractionPol(_UniswapLiquidityContract);
        AaveV3 = AaveV3InteractionPol(_AAVE);
        swap = Swap(_SWAP);
        owner = msg.sender;
        // UNI = _uniContract;
        //token = GoldDust(_token);
        //you get the values from the liquidity contracts
        // usdc = USDC;
        // usdt = USDT;
        // dai = DAI;
    }

/**
 * @dev function to invest in the strategy that the user chooses from front-end
 * @param _buyer address of the user
 * @param _collateral address of the token used for payment | it should be whitelisted by fija
 * @param _value amount of that token in the native decimals from the token. ex: USDC = 6 decimals
 * @param feeSwapUSDT measn the fee of the pool USDC/USDT that you want to target
 */

 //@audit solve stack to deep. ADD a referacl code like uniswap to track
 //@audit-info make it internal an only callable by teh vault??
 //@audit what if more than 1 users money is invested at a time. Identifier brokes?
    function invest(
        address _buyer,
        address _collateral,
       uint _value,
       uint amountOut,
       uint24 feeSwapUSDT,
       uint24 feeSwapWMATIC,
       uint24 feeSwapDAI,
       uint24 poolFee1,
       uint24 poolFee2,
       bytes32 identifier //could be unit

    )
        external
        nonReentrant
        // returns (
        //     // uint uniswapUSDCUSDT, uint uniswapUSDCDAI, uint  aaveWMATIC, uint aaveDAI

        // )
    {
        //how much they want to invest
        //ADD THE REQUIRE OPEN
        require(isOpen == true, "not opened");
        require(whUser[msg.sender] == true, "not whitelisted");
        require(_value >= costStrategy, "the strategy costs more");
        require(collaterals[_collateral] == true, "not whitelisted");
        require(IERC20(_collateral).balanceOf(_buyer) >= _value,"not enough balance");
        
        _invest(  _buyer,   _collateral,   _value,  amountOut,  feeSwapUSDT,  feeSwapWMATIC,  feeSwapDAI, poolFee1, poolFee2, identifier );
        // amounInvested[_buyer] += _value;
        // identifiers[identifier] += _value;
        // //@audit use safetTransferFrom
        // IERC20(_collateral).transferFrom(_buyer, address(this), _value);
        // console.log("collateral transfered to the strategy");

        // uint uniswapUSDCUSDT = _value.mul(30).div(100);
        // uint uniswapUSDCDAI = _value.mul(30).div(100);
        // uint aaveWMATIC = _value.mul(20).div(100);
        // uint aaveDAI = _value.mul(20).div(100);

        ( uint uniswapUSDCUSDT, uint uniswapUSDCDAI, uint aaveWMATIC, uint aaveDAI) = makePercentages(_value);
        //@audit see how to swap the best way and percentages
       
        // swap.swapExactInputSingle(_value,amountOut,_collateral, USDT, feeSwapUSDT);
        // swap.swapExactInputSingle(_value,amountOut,_collateral, DAI, feeSwapDAI);
        // swap.swapExactInputSingle(_value,amountOut,_collateral, WMATIC, feeSwapWMATIC);
        SwapTokens(_value,amountOut,_collateral, USDT, feeSwapUSDT);
        SwapTokens(_value,amountOut,_collateral, DAI, feeSwapDAI);
        SwapTokens(_value,amountOut,_collateral, WMATIC, feeSwapWMATIC);
        mintPositonUni(_buyer, uniswapUSDCUSDT,  uniswapUSDCUSDT,  USDC, USDT, poolFee1);
        mintPositonUni(_buyer, uniswapUSDCDAI,  uniswapUSDCDAI,  USDC, DAI, poolFee2);
        supplyAave(aaveWMATIC,WMATIC);
        supplyAave(aaveDAI,DAI);
        //@audit-info check amount supplied for slippage protections
        emit InvestedStrategy(_buyer, _collateral, _value);
    }

//@audit  an only to address(this) modifier?
    function SwapTokens(uint amountIn, uint amountMinOut, address _tokenIn, address _tokenOut, uint24 poolFee)internal {
        //@audit-info check slippage
        swap.swapExactInputSingle(amountIn,amountMinOut,_tokenIn, _tokenOut, poolFee);
    }

    function mintPositonUni( address _strategyInvestor,uint _value0,uint _value1,address _token1,address _token2,uint24 poolFee)internal{
         Uniswap.mintNewPosition(_strategyInvestor, _value0,  _value1,  _token1, _token2, poolFee);
    }
    function supplyAave(uint _amount, address _token)internal{
       AaveV3.supply(_amount,_token);
    }

    function makePercentages(uint _value)internal returns(uint uniswapUSDCUSDT, uint uniswapUSDCDAI, uint  aaveWMATIC, uint aaveDAI){
        uint uniswapUSDCUSDT = _value.mul(30).div(100);
        uint uniswapUSDCDAI = _value.mul(30).div(100);
        uint aaveWMATIC = _value.mul(20).div(100);
        uint aaveDAI = _value.mul(20).div(100);
    }
    function _invest( address _buyer,
        address _collateral,
       uint _value,
       uint amountOut,
       uint24 feeSwapUSDT,
       uint24 feeSwapWMATIC,
       uint24 feeSwapDAI,
       uint24 poolFee1,
       uint24 poolFee2,
       bytes32 identifier )internal{
        amounInvested[_buyer] += _value;
        identifiers[identifier] += _value;
        //@audit use safetTransferFrom
        IERC20(_collateral).transferFrom(_buyer, address(this), _value);
    }

    // uint256 fee = _value.mul(metaBatches[batchId].buyFeePct).div(PCT_BASE);
    // IERC20(_collateral).safeTransferFrom(_buyer, beneficiary, fee);

    function open(bool _status) external onlyOwner {
        isOpen = _status;
    }

    function changeStrategyCost(uint newCost) external onlyOwner {
        costStrategy = newCost;
    }

    function addCollateralToken(address _collateral, bool _add) external onlyOwner {
        require(
            collaterals[_collateral] != _add,
            "can't add again"
        );
        collaterals[_collateral] = _add;
    }

    function addReseller(address _reseller, bool _bool )external onlyOwner{
       resellers[_reseller] == _bool;
    }

    // function removeCollateralToken(address _collateral) external onlyOwner {
    //     require(
    //         collaterals[_collateral] == true,
    //         "can't remove a collateral not whitelisted"
    //     );
    //     collaterals[_collateral] = false;
    // }

    //withdraws the funds that we have inside teh contract
    function withdrawCollateral(
        address _collateral,
        address _address,
        uint _amount
    ) external onlyOwner {
        //@audit safeTransfer
        IERC20(_collateral).transfer(_address, _amount);
    }

    // Emergency method to withdraw NFT in case someone sends..
    function withdrawNFT(
        address _token,
        uint _tokenId,
        address _address
    ) external onlyOwner {
        IERC721(_token).safeTransferFrom(address(this), _address, _tokenId);
    }
    
    //check why not calldata
    function whAddress(address[] memory _addr, bool _wh)external  {
        //reseller can whitelist
        require(owner == msg.sender  || resellers[msg.sender] == true);
        //Take care with DOS error from or side in the for loop
        //TODO check whether it passes the right addresses 
      for (uint i = 0; i < _addr.length; i ++){
        address addr = _addr[i];
        whUser[addr] = _wh;
      }
    }

    //THIS WAY THE USER CAN WITHDRAW ALL THE FUNDS FROM THIS  STRATEGY AT ONCE
    // ALERT CHECKKKKKKKKKK ADDRESSES AND SHADOWING
    //@audit make the swapping back for the tokens
    function withdrawLiquidityInvestor(address _seller)
        external onlyOwner
        nonReentrant
        returns (bool)
    {
        require(
            Uniswap.checkPositionFromInvestor(_seller).length > 0,
            "The wallet has not  invested before"
        );
        uint[] memory nfts = Uniswap.checkPositionFromInvestor(_seller);
        //DOS for a wallet that has 1k NFTs? Is that even posible if they provide 1000times small liquidity? Not boder
        unchecked{
        for (uint i = 0; i < nfts.length; ++i) {
            uint nftId = nfts[i];
            // Uniswap.collectAllFees(_seller);

            //TODO: WITHDRAW THE FUNDS
            //@audit emit just 1 event as reinvest
            emit WithdrawStrategy(_seller, nftId);
        }
        }
        amounInvested[_seller] = 0;

        //COMPLETE AAVE ********************************************************************************
        // AaveV3.withdrawAave(_token, _amount, _to);
        return true;
    }

    function _withdraw()internal{
        
    }

// @dev Function made to reinvest each 2 weeks all the yield accumulated from the strategy and the positions in the different DEFI protocols
// @notice It checks how much yield is generated from the positions in each strategy and then it calculates the rebalance so there is always the % of every token as stipulated in the strategy


//@audit-info  calculate swapping fees accrued for user. Check fees thorugh DEXs
//@audit call christoph. Make the rebalancing. Swap yield for USDC, take out 25%. Reuse te deposit function again.
    function reinvest(address _user)external onlyOwner returns (bool, uint128 liquidity){
//CHECK POSITIONS

    uint liquidityUni;
    uint liquidityAave;
    require(
            Uniswap.checkPositionFromInvestor(_user).length > 0,
            "The wallet has not  invested before"
        );
        uint[] memory nfts = Uniswap.checkPositionFromInvestor(_user);
        //DOS for a wallet that has 1k NFTs? Is that even posible if they provide 1000times small liquidity? Not boder
        unchecked{
        for (uint i = 0; i < nfts.length; ++i) {
            uint nftId = nfts[i];
            // Uniswap.collectAllFees(nftId);
            (,,liquidity) = _reinvest(nftId);
            liquidityUni = liquidityUni + liquidity;

        }
        //@audit do aave also
        //@audit add the liquidityAave to aaves logic
        emit Compounding(liquidityAave, liquidityUni );
        //@audit check liquidity make percentages and swap again? No to much fees
    }
}

function _reinvest(uint _nftId)internal returns(uint amount0, uint amount1, uint128 liquidity){
        (amount0, amount1) =  Uniswap.collectAllFees(_nftId);
        // uint amount0 = amount0;
        // uint amount1 = amount1;
        (liquidity , ,) =  Uniswap.increaseLiquidityCurrentRange(_nftId, amount0, amount1);

}
}