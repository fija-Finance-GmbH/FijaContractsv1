// const Strategy = require("../../artifacts/contracts/ethereum/v3EventBackend/strategy.sol/FijaStrategyFull.json")
const { ethers } = require("hardhat")
const {
  USDTar_WHALE,
  USDCar_WHALE,
  DAIar_WHALE,
  WBTC_WHALE,
  WETH_WHALE,
  WMATIC,
  WMATIC_WHALE,
  DAIar,
  USDCar,
  USDTar,
  WETH,
  WBTC,
} = require("./helpers/addresses")
require("dotenv").config()

//AVAILABLE POOLS *****************************************ANOTATIONS
// USDC USDT 0.01
// WBTC / WETH 0.05
// USDC / WETH 0.05
// //8 decimals
// //18 DECIMALS
//WMATIC WETH 0.3 //18decimals both $1.27k MATIC
//WMATIC USDC 0.05
//USDC DAI 0.01

const main = async () => {
  let UniswapV3,
    stra,
    accounts,
    weth,
    usdc,
    usdt,
    dai,
    wmatic,
    usdcAmount,
    wethAmount,
    daiAmount,
    wmaticAmount1,
    wmaticAmount2,
    usdtAmount,
    wethWhale,
    usdcWhale,
    usdtWhale,
    daiWhale,
    wmaticWhale,
    uni,
    strategy,
    daiAmount1,
    daiAmount2,
    Aave,
    aave,
    tokenAddr
  let straCost = "500000000"
  let iniSupply = ethers.utils.parseEther("200000000")

  accounts = await ethers.getSigners()
  this.fija = accounts[0]
  this.buyer = accounts[1]
  // straCost = "100000000" //100

  uni = await ethers.getContractFactory("UniswapV3InteractionPol")
  Aave = await ethers.getContractFactory("AaveV3InteractionPol")
  strategy = await ethers.getContractFactory("FijaStrategyTestPol")
  fijaToken = await ethers.getContractFactory("FijaToken")
  vault = await ethers.getContractFactory("Vault")

  UniswapV3 = await uni.deploy()
  await UniswapV3.deployed()
  console.log(`The uniswapv3 contract address is: ${UniswapV3.address}`)
  aave = await Aave.deploy()
  await aave.deployed()
  console.log(`The Aave address is: ${aave.address}`)
  stra = await strategy.deploy(straCost, UniswapV3.address, aave.address)
  await stra.deployed()
  console.log(`The strategy address is: ${stra.address}`)
  FIJAtoken = await fijaToken.deploy(
    this.fija.address,
    iniSupply,
    "FIJA TOKEN",
    "FIJTKN",
    18
  )
  await FIJAtoken.deployed()
  console.log(`Fija's Token address is: ${FIJAtoken.address}`)
  tokenAddr = FIJAtoken.address

  Vault = await vault.deploy(tokenAddr)
  await Vault.deployed()
  console.log(`Fija's Vault address is: ${Vault.address}`)

  wethWhale = await ethers.getSigner(WETH_WHALE)
  daiWhale = await ethers.getSigner(DAIar_WHALE)
  usdcWhale = await ethers.getSigner(USDCar_WHALE)
  usdtWhale = await ethers.getSigner(USDTar_WHALE)
  wmaticWhale = await ethers.getSigner(WMATIC_WHALE)
  weth = await ethers.getContractAt("IWETH", WETH)
  usdc = await ethers.getContractAt("IERC20", USDCar)
  usdt = await ethers.getContractAt("IERC20", USDTar)
  dai = await ethers.getContractAt("IERC20", DAIar)
  wmatic = await ethers.getContractAt("IERC20", WMATIC)
  //   weth = await ethers.getContractAt("IERC20", WETH)

  // Unlock DAI and USDC whales
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [USDTar_WHALE],
  })
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [USDCar_WHALE],
  })
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [DAIar_WHALE],
  })
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [WETH_WHALE],
  })
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [WMATIC_WHALE],
  })

  wethAmount = ethers.utils.parseEther("2000") //100
  wmaticAmount1 = ethers.utils.parseEther("2000") //100
  wmaticAmount2 = ethers.utils.parseEther("2000") //100
  daiAmount1 = ethers.utils.parseEther("2000") //100
  daiAmount2 = ethers.utils.parseEther("2000") //100
  usdcAmount = "2000000000" //original: 100000000
  usdtAmount = "2000000000"

  await weth.connect(wethWhale).transfer(this.fija.address, wethAmount)
  await dai.connect(daiWhale).transfer(this.fija.address, daiAmount1)
  await dai.connect(daiWhale).transfer(this.fija.address, daiAmount2)
  await usdc.connect(usdcWhale).transfer(this.fija.address, usdcAmount)
  await usdc.connect(usdcWhale).transfer(this.buyer.address, usdcAmount)
  await usdt.connect(usdtWhale).transfer(this.fija.address, usdtAmount)
  await wmatic.connect(wmaticWhale).transfer(this.fija.address, wmaticAmount1)
  await wmatic.connect(wmaticWhale).transfer(this.fija.address, wmaticAmount2)
  console.log("stable coins and  tokens transfered to us and buyer from wales")

  await stra.addCollateralToken(usdc.address, true)
  console.log("whitelisted collateral for users to invest")

  await usdc.connect(this.buyer).approve(stra.address, straCost)
  await usdc.connect(this.fija).approve(UniswapV3.address, usdcAmount)
  await dai.connect(this.fija).approve(UniswapV3.address, daiAmount1)
  await dai.connect(this.fija).approve(aave.address, daiAmount2)
  await usdt.connect(this.fija).approve(UniswapV3.address, usdtAmount)
  await usdt.connect(this.fija).allowance(this.fija.address, UniswapV3.address) //check usdt allowance
  await weth.connect(this.fija).approve(UniswapV3.address, wethAmount)
  await wmatic.connect(this.fija).approve(UniswapV3.address, wmaticAmount1)
  await wmatic.connect(this.fija).approve(aave.address, wmaticAmount2)
  console.log("approved all the amounts to the strategy and uniswap contract")

  await stra.open(true)
  console.log("opened the strategy...")

  await stra.whAddress([this.buyer.address], true)
  console.log("whitelisting user...")

  //get the collateral and the address from the front-end
  const tx = await stra
    .connect(this.buyer)
    .invest(this.buyer.address, usdc.address, straCost)
  const receipt = await tx.wait()
  console.log("invested")
  const event = receipt.events?.filter((x) => {
    return x.event == "InvestedStrategy"
  })
  // console.log(event)
  const buyer = event["0"]["args"]["buyer"]
  const collateral = event["0"]["args"]["collateral"]
  const value = event["0"]["args"]["value"].toString()
  console.log(
    "*********************USER INVESTED IN FIJA'S STRATEGY********************"
  )

  console.log(`The address: ${buyer}, bougth: ${value} of ${collateral}`)

  //MAKE THE PERCENTAGES
  let uniUSDC = (value * 20) / 100 / 10 ** 6
  let uniUSDT = (value * 20) / 100 / 10 ** 6
  let uniDAI = (value * 20) / 100 / 10 ** 6
  let uniWMATIC = (value * 20) / 100 / 10 ** 6
  let uniWETH = 78
  // const uniWETH = (value * 20) / 100 / 10 ** 6
  console.log(`WETH: ${uniWETH}, usdc/usdt/dai: ${(uniUSDC, uniUSDT, uniDAI)}`)

  await weth.connect(this.fija).transfer(UniswapV3.address, wethAmount)
  await usdc.connect(this.fija).transfer(UniswapV3.address, usdcAmount)
  await usdt.connect(this.fija).transfer(UniswapV3.address, usdtAmount)
  await wmatic.connect(this.fija).transfer(UniswapV3.address, wmaticAmount1)
  await wmatic.connect(this.fija).transfer(aave.address, wmaticAmount2)
  await dai.connect(this.fija).transfer(UniswapV3.address, daiAmount1)
  await dai.connect(this.fija).transfer(aave.address, daiAmount2)

  console.log("Transfered stable coins from us to the Uniswap contract")
  const w = await UniswapV3.connect(this.fija).mintNewPosition(
    buyer,
    uniUSDC,
    USDCar,
    USDTar,
    100
  )
  console.log("Invested USDC USDT")
  await w.wait()

  const inv = await UniswapV3.connect(this.fija).mintNewPosition(
    buyer,
    uniUSDC,
    USDCar,
    DAIar,
    100
  )
  console.log("Invested USDC DAI")

  console.log(
    "**********************************INTRODUCTION AAVEV3******************************"
  )

  await aave.supply(uniDAI, DAIar)
  console.log("supplied to AAVE SUCCESFULL!!")
  await aave.supply(uniWMATIC, WMATIC)
  console.log("supplied to AAVE WMATIC!!")

  console.log(
    "**********************************WITHDRAW AAVEV3******************************"
  )
  await aave.withdrawAave(DAIar, uniDAI, this.fija.address)
  console.log("withdrawn")

  const [position1, position2] = await UniswapV3.checkPositionFromInvestor(
    buyer
  )
  console.log(position1.toString())
  console.log(position2.toString())
  console.log("Compound the interests")
  await UniswapV3.collectAllFees(position1)
  console.log("fees collected")

  console.log("Now the user WANTS TO WITHDRAW OHHHH")
  const withdraw = await stra
    .connect(this.buyer)
    .withdrawLiquidityInvestor(this.buyer.address)
  const receipt2 = await withdraw.wait()
  console.log("Withdrawing.....")
  // console.log(receipt2.logs)

  const event2 = receipt2.events?.filter((x) => {
    return x.event == "WithdrawStrategy"
  })

  const seller = await event2["0"]["args"]["seller"]
  const tokenId = await event2["0"]["args"]["tokenId"].toString()
  console.log(
    `The address: ${seller} liquidated the position: ${tokenId} in uniswap`
  )
  await UniswapV3.retrieveNFT(tokenId)
  console.log("retrieved nft")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
