// contracts/AaveExample.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


//REUSABLE CONTRACT FOR ANY TOKEN IN AAVE
//CONTRACT REUSABLE BETWEEN BLOCKCHAINS

/**
 * INSTEAD OF DOING ONLYOWNER IN EACH CONTRACT CREATE A MODIFIER IN ONE CONTRACT AND A MODIFIER IN THE OTHER ONES THAT ATTAHC TOO THE OTHER STATE VAARIABLE
 */
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";

contract AaveV3InteractionPol {
    address Owner;

    address public immutable  aPolDAI = 0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE;
    address public immutable aPolUSDC = 0x625E7708f30cA75bfd92586e17077590C60eb4cD;
    address public immutable aPolUSDT = 0x6ab707Aca953eDAeFBc4fD23bA73294241490620;
    address public immutable aPolAave = 0xf329e36C7bF6E5E86ce2150875a84Ce77f477375;
    address public immutable aPolLink = 0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530;
    address public immutable aPolWBTC = 0x078f358208685046a11C85e8ad32895DED33A249;
    address public immutable aPolWETH = 0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8;
    address public immutable aPolWMATIC = 0x6d80113e533a2C0fe82EaBD35f1875DcEA89Ea97;

    address public immutable  aOpDAI = 0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE;
    address public immutable aOpUSDT = 0x6ab707Aca953eDAeFBc4fD23bA73294241490620;
    address public immutable aOpUSDC = 0x625E7708f30cA75bfd92586e17077590C60eb4cD;
    address public immutable aOpAave = 0xf329e36C7bF6E5E86ce2150875a84Ce77f477375;
    address public immutable aOpLink = 0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530;
    address public immutable aOpWBTC = 0x078f358208685046a11C85e8ad32895DED33A249;
    address public immutable aOpWETH = 0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8;


    address public immutable  aArDAI = 0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE;
    address public immutable aArUSDC = 0x625E7708f30cA75bfd92586e17077590C60eb4cD;
    address public immutable aArUSDT = 0x6ab707Aca953eDAeFBc4fD23bA73294241490620;
    address public immutable aArAave = 0xf329e36C7bF6E5E86ce2150875a84Ce77f477375;
    address public immutable aArLink = 0x191c10Aa4AF7C30e871E70C95dB0E4eb77237530;
    address public immutable aArWBTC = 0x078f358208685046a11C85e8ad32895DED33A249;
    address public immutable aArWETH = 0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8;


    address public aavePoolAddress = 0x794a61358D6845594F94dc1DB02A252b5b4814aD; //polygon pool address //same on in each blockchain

    //IN ORDER TO KNOW EXACTLY THE INTEREST, AAVE DOES NOT PROVIDE HOW TO DO IT. WE CAN MAP EACH TOKEN ADDRESS TO THE QUANTITY SUPPLIED AND DELTE THE AMOUNT ONCE WITHDRAWN.
    //SO THE INTEREST WILL BE THE ENITRE MINUS THE INVESTED AMOUNT

    modifier OwnerOnly() virtual {
        require(msg.sender == Owner);
        _;
    }

       address private immutable linkAddress =
        0x07C725d58437504CA5f814AE406e70E21C5e8e9e;
    IERC20 private link;
    constructor() {
        Owner = msg.sender;
        link = IERC20(linkAddress);
    }

    function supply(uint _amount, address _token) external OwnerOnly returns (bool) {
        require(_amount >0, "wrong amount");
        require(
            IERC20(_token).balanceOf(address(this)) >= _amount,
            "not enough dai in the contract"
        );
        // 1. Set amountToDrain to the contract's supplyTokenAddress balance
        // uint amountToDrain = IERC20(supplyTokenAddress).balanceOf(address(this));

        // 2. Approve Aave pool to access amountToDrain from this contract
        IERC20(_token).approve(aavePoolAddress, _amount);
//@audit transfer tha amount to us first??
        // 3. Supply amountToDrain to Aave pool
        IPool(aavePoolAddress).supply(
            _token,
            _amount,
            //@audit check address(this) and msg.sender to not be onbehalf of
            address(this),
            0
        );

        return true;
    }


 /**
   * @notice Returns the user account data across all the reserves
   * @param _userAddress The address of the user
   * @return totalCollateralBase The total collateral of the user in the base currency used by the price feed
   * @return totalDebtBase The total debt of the user in the base currency used by the price feed
   * @return availableBorrowsBase The borrowing power left of the user in the base currency used by the price feed
   * @return currentLiquidationThreshold The liquidation threshold of the user
   * @return ltv The loan to value of The user
   * @return healthFactor The current health factor of the user
   **/
    function getData(address _userAddress)
        external
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        return IPool(aavePoolAddress).getUserAccountData(_userAddress);
    }


//To withdraw everything with interest, we should be able to get the balanceOf this aTokens and substract them to the initial value. 
//So balance(this) - initial value, or withdraw everything 
//the interest is generated in this aTokens
    function withdrawAave(address _token, uint _amount, address _to)external OwnerOnly returns (uint256) {
         return IPool(aavePoolAddress).withdraw(_token,_amount,_to);
     
    }

    function approveLINK(uint256 _amount, address _poolContractAddress)
        external
        returns (bool)
    {
        return link.approve(_poolContractAddress, _amount);
    }

    function allowanceLINK(address _poolContractAddress)
        external
        view
        returns (uint256)
    {
        return link.allowance(address(this), _poolContractAddress);
    }

    function getBalance(address _tokenAddress) external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }


}
