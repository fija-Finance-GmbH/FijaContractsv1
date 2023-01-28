// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;


import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-periphery/contracts/base/LiquidityManagement.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract UniswapV3InteractionPol is IERC721Receiver {
    using SafeMath for uint;

    //POLYGON
    address private constant DAI = 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063;
    address private constant USDC = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
    address private constant USDT = 0xc2132D05D31c914a87C6611C10748AEb04B58e8F;
    address private constant WETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;
    address private constant WMATIC = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270;
    address private constant  WBTC = 0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6;

//MAINNET
address private constant  mainDAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
address private constant  mainUSDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
address private constant  mainUSDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
address private constant  mainWETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
address private constant  mainWBTC = 0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599;

//OPTIMISM
address private constant  opUSDT = 0x94b008aA00579c1307B0EF2c499aD98a8ce58e58;
address private constant  opDAI = 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1;
address private constant  opWBTC = 0x68f180fcCe6836688e9084f035309E29Bf0A2095;
address private constant  USDCop = 0x7F5c764cBc14f9669B88837ca1490cCa17c31607;

//ARBITRUM
address private constant  USDTar = 0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9;
address private constant  USDCar = 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8;
address private constant  DAIar = 0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1;
address private constant  WETHar = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    
    //FEES
    //POLYGON
    uint24 public constant poolFeeUSDCUSDT = 100;
    uint24 public constant poolFeeUSDCWETH = 500;
    uint24 public constant poolFeeWMATICWETH = 3000;
    uint24 public constant poolFeeWMATICUSDC = 500;
    uint24 public constant poolFeeWbtcWETH = 500;
    uint24 public constant poolFeeWbtcUSDC = 3000;
//MAINNET
    uint24 public constant poolFeeMainDAIUSDC = 100;
    uint24 public constant poolFeeMainUSDCETH = 500;
    uint24 public constant poolFeeMainWbtcETH = 3000;
    uint24 public constant poolFeeMainUSDCUSDT = 300;
    uint24 public constant poolFeeMainETHUSDT = 3000;
//OPTIMISM
    uint24 public constant poolFeeOpWETHOp = 3000;
    uint24 public constant poolFeeOpWETHUSDC = 500;
    uint24 public constant poolFeeOpWETHDAI = 300;
    uint24 public constant poolFeeOpUSDCDAI = 100;
    uint24 public constant poolFeeOpWETHWbtc = 3000;
//ARBITRUM
    uint24 public constant poolFeeArWETHUSDC = 500;
    uint24 public constant poolFeeArUSDTUSDC = 500;
    uint24 public constant poolFeeArWbtcWETH = 3000;
    uint24 public constant poolFeeArDAIUSDC = 500;
    uint24 public constant poolFeeArWETHUSDT = 500;




//0.3%
    // uint24 public constant poolFeeUSDCUSDT = 3000;
    // 0.01% fee
    //check the video from smart contract programmer
    // uint24 public constant poolFee = 100;
    address _owner;
    //*******TESTING */
    //mapping that aims to track the address of the buyer of the strategy mapped to the tokenID from Uniswap
    mapping(address => uint[]) public buyerToNFT;

    // Wraps Uniswap V3 positions in the ERC721 non-fungible token interface
    //research: https://docs.uniswap.org/contracts/v3/reference/periphery/NonfungiblePositionManager
    INonfungiblePositionManager public nonfungiblePositionManager =
        INonfungiblePositionManager(0xC36442b4a4522E871399CD717aBDD847Ab11FE88);
    /// @notice Represents the deposit of an NFT
    struct Deposit {
        address owner;
        uint128 liquidity;
        address token0;
        address token1;
    }

    /// @dev deposits[tokenId] => Deposit
    /// 
    mapping(uint => Deposit) public deposits;

    //CHECK OWNERS SHADWO IN REMIX
    modifier onlyOwner() virtual {
        require(msg.sender == _owner);
        _;
    }

    constructor() {
        _owner = msg.sender;
    }

    // Implementing `onERC721Received` so this contract can receive custody of erc721 tokens
    //THIS FUNCTION GET THE NFT THAT UNISWAP SENDS TO YOU AND  CREATES A DEPOSIT

    function onERC721Received(
        address operator,
        address,
        uint tokenId,
        bytes calldata
    ) external override returns (bytes4) {
        // get position information
        //@audit does anyone can call it?

        _createDeposit(operator, tokenId);

        return this.onERC721Received.selector;
    }

/// @dev the owner is fija instead of the investor, to solve that, change the paramenter from the mintPosition function
///msg.sender ----> _strategyInvestor

    function _createDeposit(address owner, uint tokenId) internal {
        (
            ,
            ,
            address token0,
            address token1,
            ,
            ,
            ,
            uint128 liquidity,
            ,
            ,
            ,

        ) = nonfungiblePositionManager.positions(tokenId);

        // set the owner and data for position
        // operator is msg.sender
        deposits[tokenId] = Deposit({
            owner: owner,
            liquidity: liquidity,
            token0: token0,
            token1: token1
        });
        console.log("NFT id from investment", tokenId);
        console.log("Liquidity", liquidity);
    }

    /// @notice Calls the mint function defined in periphery, mints the same amount of each token.
    /// For this example we are providing 1000 DAI and 1000 USDC in liquidity
    /// @return tokenId The id of the newly minted ERC721
    /// @return liquidity The amount of liquidity for the position
    /// @return amount0 The amount of token0
    /// @return amount1 The amount of token1

    //TODO: add only owner??
    function mintNewPosition(
        address _strategyInvestor,
        uint _value0,
        uint _value1,
        address _token1,
        address _token2,
    uint24 poolFee
    )
        external
        returns (
            uint tokenId,
            uint128 liquidity,
            uint amount0,
            uint amount1
        )
    {
        uint amount0ToMint;
        uint amount1ToMint;
   
   //@audit-info add decimals value_ = _amount.mul(10**IERC20Metadata(address(OHM)).decimals()).div(10**IERC20Metadata(_token).decimals());
        address(_token2) == address(DAI)
            ? amount1ToMint = _value1 * 1e18
            : amount1ToMint = _value1 * 1e6;
        amount0ToMint = _value0 * 1e6;

        // Approve the position manager
        TransferHelper.safeApprove(
            _token1,
            address(nonfungiblePositionManager),
            amount0ToMint
        );
        TransferHelper.safeApprove(
            _token2,
            address(nonfungiblePositionManager),
            amount1ToMint
        );

        INonfungiblePositionManager.MintParams
            memory params = INonfungiblePositionManager.MintParams({
                token0: _token1,
                token1: _token2,
                fee: poolFee,
                tickLower: TickMath.MIN_TICK,
                tickUpper: TickMath.MAX_TICK,
                amount0Desired: amount0ToMint,
                amount1Desired: amount1ToMint,
                //@audit change this to amount Min
                amount0Min: amount0ToMint.mul(70).div(100),
                amount1Min: amount1ToMint.mul(70).div(100),
                recipient: address(this),
                deadline: block.timestamp
            });

        // Note that the pool defined by _token1/_token2 and fee tier 0.3% must already be created and initialized in order to mint
        (tokenId, liquidity, amount0, amount1) = nonfungiblePositionManager
            .mint(params);

        // Create a deposit

        //@audit owner msg.sender, chekc investor or strategy contract
        _createDeposit(msg.sender, tokenId);

        // Remove allowance and refund in both assets.
        if (amount0 < amount0ToMint) {
            TransferHelper.safeApprove(
                _token1,
                address(nonfungiblePositionManager),
                0
            );
            uint refund0 = amount0ToMint - amount0;
            TransferHelper.safeTransfer(_token1, msg.sender, refund0);
        }

        if (amount1 < amount1ToMint) {
            TransferHelper.safeApprove(
                _token2,
                address(nonfungiblePositionManager),
                0
            );
            uint refund1 = amount1ToMint - amount1;
            TransferHelper.safeTransfer(_token2, msg.sender, refund1);
        }
        buyerToNFT[_strategyInvestor].push(tokenId);
        console.log("LIQUIDITY SUCCEDED!");
    }

    /// @notice Collects the fees associated with provided liquidity
    /// @dev The contract must hold the erc721 token before it can collect fees
    /// @param tokenId The id of the erc721 token
    /// @return amount0 The amount of fees collected in token0
    /// @return amount1 The amount of fees collected in token1
    function collectAllFees(uint tokenId)
        external
        returns (uint amount0, uint amount1)
    {
        // Caller must own the ERC721 position, meaning it must be a deposit

        // set amount0Max and amount1Max to uint256.max to collect all fees
        // alternatively can set recipient to msg.sender and avoid another transaction in `sendToOwner`
        INonfungiblePositionManager.CollectParams
            memory params = INonfungiblePositionManager.CollectParams({
                tokenId: tokenId,
                recipient: address(this),
                amount0Max: type(uint128).max,
                amount1Max: type(uint128).max
            });

        (amount0, amount1) = nonfungiblePositionManager.collect(params);

        // send collected fees back to owner
        _sendToOwner(tokenId, amount0, amount1);

        //CHANGE THE SEND TO OWNER FOR REINVEST
        console.log("fee 0", amount0);
        console.log("fee 1", amount1);
    }

    /// @notice A function that decreases the current liquidity by half. An example to show how to call the `decreaseLiquidity` function defined in periphery.
    /// @param tokenId The id of the erc721 token
    /// @return amount0 The amount received back in token0
    /// @return amount1 The amount returned back in token1
    function decreaseLiquidityInHalf(uint tokenId)
        external
        returns (uint amount0, uint amount1)
    {
        // caller must be the owner of the NFT
        require(msg.sender == deposits[tokenId].owner, "Not the owner");
        // get liquidity data for tokenId
        uint128 liquidity = deposits[tokenId].liquidity;
        uint128 halfLiquidity = liquidity / 2;

        // amount0Min and amount1Min are price slippage checks
        // if the amount received after burning is not greater than these minimums, transaction will fail
        INonfungiblePositionManager.DecreaseLiquidityParams
            memory params = INonfungiblePositionManager
                .DecreaseLiquidityParams({
                    tokenId: tokenId,
                    liquidity: halfLiquidity,
                    //@audit add more than 0 or require that you got amount min
                    amount0Min: 0,
                    amount1Min: 0,
                    deadline: block.timestamp
                });

        (amount0, amount1) = nonfungiblePositionManager.decreaseLiquidity(
            params
        );

        //send liquidity back to owner
        _sendToOwner(tokenId, amount0, amount1);
    }

    /// @notice Increases liquidity in the current range
    /// @dev Pool must be initialized already to add liquidity
    /// @param tokenId The id of the erc721 token
    /// @param amount0 The amount to add of token0
    /// @param amount1 The amount to add of token1
    function increaseLiquidityCurrentRange(
        uint tokenId,
        uint amountAdd0,
        uint amountAdd1
    )
        external
        returns (
            uint128 liquidity,
            uint amount0,
            uint amount1
        )
    {
        TransferHelper.safeTransferFrom(
            deposits[tokenId].token0,
            msg.sender,
            address(this),
            amountAdd0
        );
        TransferHelper.safeTransferFrom(
            deposits[tokenId].token1,
            msg.sender,
            address(this),
            amountAdd1
        );

        TransferHelper.safeApprove(
            deposits[tokenId].token0,
            address(nonfungiblePositionManager),
            amountAdd0
        );
        TransferHelper.safeApprove(
            deposits[tokenId].token1,
            address(nonfungiblePositionManager),
            amountAdd1
        );

        uint amount0Min = amountAdd0.mul(90).div(100);
        uint amount1Min = amountAdd1.mul(90).div(100);

        INonfungiblePositionManager.IncreaseLiquidityParams
            memory params = INonfungiblePositionManager
                .IncreaseLiquidityParams({
                    tokenId: tokenId,
                    amount0Desired: amountAdd0,
                    amount1Desired: amountAdd1,
                    amount0Min: amount0Min,
                    amount1Min: amount1Min,
                    deadline: block.timestamp
                });

        (liquidity, amount0, amount1) = nonfungiblePositionManager
            .increaseLiquidity(params);

        console.log("liquidity", liquidity);
        console.log("amount 0", amount0);
        console.log("amount 1", amount1);
    }

    /// @notice Transfers funds to owner of NFT
    /// @param tokenId The id of the erc721
    /// @param amount0 The amount of token0
    /// @param amount1 The amount of token1
    function _sendToOwner(
        uint tokenId,
        uint amount0,
        uint amount1
    ) internal {
        // get owner of contract
        address owner = deposits[tokenId].owner;

        address token0 = deposits[tokenId].token0;
        address token1 = deposits[tokenId].token1;
        // send collected fees to owner
        TransferHelper.safeTransfer(token0, owner, amount0);
        TransferHelper.safeTransfer(token1, owner, amount1);
    }

    /// @notice Transfers the NFT to the owner
    /// @param tokenId The id of the erc721
    function retrieveNFT(uint tokenId) external {
        // must be the owner of the NFT
        require(msg.sender == deposits[tokenId].owner, "Not the owner");
        // transfer ownership to original owner
        nonfungiblePositionManager.safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );
        //remove information related to tokenId
        delete deposits[tokenId];
    }

    function withdrawStuckFunds(address _collateral, address _address)
        external
        virtual
        onlyOwner
    {
        IERC20(_collateral).transfer(_address, address(this).balance);
    }

    //intended for front-end and backend
    function checkPositionFromInvestor(address _investor)
        external
        view
        returns (uint[] memory)
    {
        return buyerToNFT[_investor];
    }
}
