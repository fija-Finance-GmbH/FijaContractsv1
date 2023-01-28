// const Strategy = require("../../artifacts/contracts/ethereum/v3EventBackend/strategy.sol/FijaStrategyFull.json")
const { ethers } = require("hardhat")
const BigNumber = require("big-number")
require("dotenv").config()

const straAdd = "0x103A3b128991781EE2c8db0454cA99d67b257923"
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
const DAI_WHALE = "0xc61cb8183b7692c8feb6a9431b0b23537a6402b0"
// const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2";
const USDC_WHALE = "0x42AE1d6A320e93f119d6f136912cfA12f0799B8A"
const USDT_WHALE = "0xbe18eae84ef3805fd18c585f7819087f3258b501"

//STABLE COINS ARBITRUM
const USDTar = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
const USDCar = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
const DAIar = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
const USDTar_WHALE = "0xccdead94e8cf17de32044d9701c4f5668ad0bef9"
const USDCar_WHALE = "0x62ed28802362bb79ef4cee858d4f7aca5edd0490"
const DAIar_WHALE = "0xf6c75d85ef66d57339f859247c38f8f47133bd39"

const main = async () => {
  let liquidityExamples
  let liquidityUSDT
  let stra
  let accounts
  let dai
  let usdc
  let usdt
  let straCost
  let usdcAmount
  let usdtAmount
  let daiAmount
  let daiWhale
  let usdcWhale
  let usdtWhale
  let LiquidityExamples
  let strategy
  accounts = await ethers.getSigners()
  this.buyer = accounts[1]

  LiquidityExamples = await ethers.getContractFactory("LiquidityExamplesFull")
  liquidityExamples = await LiquidityExamples.deploy()
  await liquidityExamples.deployed()
  console.log(
    `The liquidity uniswapv3 contract address is: ${liquidityExamples.address}`
  )
  straCost = "100000000" //100
  strategy = await ethers.getContractFactory("FijaStrategyFull")
  stra = await strategy.deploy(straCost, liquidityExamples.address)
  await stra.deployed()
  console.log(`The strategy address is: ${stra.address}`)
  daiWhale = await ethers.getSigner(DAI_WHALE)
  usdcWhale = await ethers.getSigner(USDC_WHALE)
  usdtWhale = await ethers.getSigner(USDT_WHALE)
  dai = await ethers.getContractAt("IERC20", DAI)
  usdc = await ethers.getContractAt("IERC20", USDC)
  usdt = await ethers.getContractAt("IERC20", USDT)

  // Unlock DAI and USDC whales
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [DAI_WHALE],
  })
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [USDC_WHALE],
  })
  await network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [USDT_WHALE],
  })

  daiAmount = ethers.utils.parseEther("300") //100

  usdcAmount = "800000000" //original: 100000000
  usdtAmount = "300000000"

  const l = await dai.connect(daiWhale).transfer(accounts[0].address, daiAmount)

  const t = await usdc
    .connect(usdcWhale)
    .transfer(accounts[0].address, usdcAmount)
  await usdc.connect(usdcWhale).transfer(this.buyer.address, usdcAmount)

  const tt = await usdt
    .connect(usdtWhale)
    .transfer(accounts[0].address, usdtAmount)
  // const balUSDT = usdt.balanceOf(accounts[0].address)
  console.log("Transfered stable coins from whales to our wallet")

  const wh = await stra.addCollateralToken(USDC)
  console.log("whitelisted collateral for users to invest")
  await wh.wait()

  const approval = await usdc
    .connect(this.buyer)
    .approve(stra.address, straCost)
  await usdc.connect(accounts[0]).approve(liquidityExamples.address, usdcAmount)
  await usdt.connect(accounts[0]).approve(liquidityExamples.address, usdtAmount)
  await usdt
    .connect(accounts[0])
    .allowance(accounts[0].address, liquidityExamples.address)
  await dai.connect(accounts[0]).approve(liquidityExamples.address, daiAmount)
  console.log("approved")

  //get the collateral and the address from the front-end
  const tx = await stra
    .connect(this.buyer)
    .invest(this.buyer.address, USDC, straCost)
  const receipt = await tx.wait()
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

  console.log(buyer, collateral, value)

  //MAKE THE PERCENTAGES
  // const uniUSDC = (value * 20) / 10
  // const uniUSDT = (value * 20) / 10
  // const uniDAI = ((value * 20) / 10 / 10 ** 6).toString()
  // const unIDAI = ethers.utils.parseEther(uniDAI)
  const uniUSDC = (value * 20) / 100 / 10 ** 6
  const uniUSDT = (value * 20) / 100 / 10 ** 6
  const uniDAI = (value * 20) / 100 / 10 ** 6

  console.log(uniDAI, uniUSDC, uniUSDT)
  await dai.connect(accounts[0]).transfer(liquidityExamples.address, daiAmount)
  await usdc
    .connect(accounts[0])
    .transfer(liquidityExamples.address, usdcAmount)
  const u = await usdt
    .connect(accounts[0])
    .transfer(liquidityExamples.address, usdtAmount)
  await u.wait()
  console.log("Transfered stable coins from us to the Uniswap contract")

  console.log(
    "*******************OUR BALANCES**************************************"
  )
  const a1 = await dai.balanceOf(accounts[0].address)
  const b1 = ethers.utils.formatEther(a1)
  console.log("DAI balance after add liquidity", b1)
  const c1 = (await usdc.balanceOf(accounts[0].address)) / 10 ** 6
  console.log("USDC balance after add liquidity", c1)
  const d1 = (await usdt.balanceOf(accounts[0].address)) / 10 ** 6
  console.log("USDT balance after add liquidity", d1)

  console.log(
    "*******************UNISWAP CONTRACT BALANCES**************************************"
  )
  const e1 = await dai.balanceOf(liquidityExamples.address)
  const f1 = ethers.utils.formatEther(e1)
  console.log("DAI balance after add liquidity", f1)
  const g1 = (await usdc.balanceOf(liquidityExamples.address)) / 10 ** 6
  console.log("USDC balance after add liquidity", g1)
  const h1 = (await usdt.balanceOf(liquidityExamples.address)) / 10 ** 6
  console.log("USDT balance after add liquidity", h1)

  console.log(
    "*******************STRATEGY CONTRACT BALANCES**************************************"
  )
  const i1 = await dai.balanceOf(stra.address)
  const j1 = ethers.utils.formatEther(i1)
  console.log("DAI balance after add liquidity", j1)
  const k1 = (await usdc.balanceOf(stra.address)) / 10 ** 6
  console.log("USDC balance after add liquidity", k1)
  const l1 = (await usdt.balanceOf(stra.address)) / 10 ** 6
  console.log("USDT balance after add liquidity", l1)
  console.log(
    "**********************************************************************************************"
  )

  const inv = await liquidityExamples
    .connect(accounts[0])
    .mintNewPosition(buyer, uniDAI, DAI, USDC)
  await inv.wait()
  console.log("done 1rst strategy")
  await liquidityExamples
    .connect(accounts[0])
    .mintNewPosition(buyer, uniUSDC, usdc.address, USDT)
  // const inv2 = await liquidityExamples
  //   .connect(accounts[0])
  //   .mintNewPosition2(uniUSDC)

  //TODO: MAKE A FOR LOOP OR SOMETHING
  // const [_token1, _token2] = await liquidityExamples.buyerToNFT[buyer]
  // console.log(_token1, _token2)
  const position = await liquidityExamples.checkPositionFromInvestor(buyer)
  const formatedPos = position.toString()
  console.log(formatedPos)
  const Pos1 = formatedPos.slice(0, 6)
  const Pos2 = formatedPos.slice(7, 100)
  console.log(Pos1)
  console.log(Pos2)
  console.log("invested")

  // const liquidity1 = await liquidityExamples.getLiquidity(368208)
  // const liquidity2 = await liquidityExamples.getLiquidity(368209)
  // console.log(`Liquidity from USDC/USDT: ${liquidity2 / 10 ** 6}`)
  // console.log(`Liquidity from USDC/DAI: ${liquidity1 / 10 ** 12}`)
  // await liquidityExamples
  //   .connect(accounts[0])
  //   .decreaseLiquidity(3960235022194623)

  console.log("done")
  console.log("done")

  console.log("INCREASING TIME")
  // suppose the current block has a timestamp of 01:00 PM
  await network.provider.send("evm_increaseTime", [36000000])
  await network.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp

  //FOR TESTING PURPOSES WE WILL TAKE THE FIRST 6 DIGITS OF THE STRINGwhit
  liquidityExamples.collectAllFees(Pos1)
  liquidityExamples.collectAllFees(Pos2)
  console.log("fees collected")

  console.log("Now the user WANTS TO WITHDRAW OHHHH")
  const withdraw = await stra
    .connect(this.buyer)
    .withdrawLiquidityInvestor(this.buyer.address)
  const receipt2 = await withdraw.wait()
  console.log("Withdrawing.....")
  // console.log(receipt2.logs)

  // let tokenId

  const event2 = receipt2.events?.filter((x) => {
    return x.event == "WithdrawStrategy"
  })
  // console.log(event)
  const seller = await event2["0"]["args"]["seller"]
  const tokenId = await event2["0"]["args"]["tokenId"].toString()
  console.log(seller, tokenId)

  // stra.on("WithdrawStrategy", (seller, tokenId) => {
  //   console.log(`Event emitted ${(seller, tokenId).toString()}`)
  // })

  await liquidityExamples.retrieveNFT(tokenId)
  console.log("retrieved nft")

  // batchIds.push(batchId);
}

// const sell = async () => {
//   //PASS THE NFT ID
//   const liquidity1 = await liquidityExamples.getLiquidity(368208)
//   const liquidity2 = await liquidityExamples.getLiquidity(368209)
//   console.log(`Liquidity from USDC/USDT: ${liquidity2 / 10 ** 6}`)
//   console.log(`Liquidity from USDC/DAI: ${liquidity1 / 10 ** 12}`)
//   await liquidityExamples.connect(accounts[0]).decreaseLiquidity(liquidity1)
// }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
