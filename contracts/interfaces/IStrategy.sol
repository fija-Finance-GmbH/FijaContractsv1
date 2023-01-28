pragma solidity ^0.8.0;

interface Strategy {
    //add the events to the strategy
    function invest(address, address, uint) external returns (bool);
    //add the reinvest

    function whAddress(address[] memory , bool)external ;
    function changeStrategyCost(uint , bool)external ;
    function open( bool)external ;
    function addCollateralToken(address , bool)external ;

    function withdrawLiquidityInvestor(address) external returns (bool);
    function withdrawNFT(address ,uint ,address ) external ;
    function withdrawCollateral(address ,address, uint  ) external ;

}