const { expect } = require("chai")
const { ethers } = require("hardhat")

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

describe("Setting up the enviroment", () => {
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

  before(async () => {
    accounts = await ethers.getSigners()
    this.buyer = accounts[1]

    LiquidityExamples = await ethers.getContractFactory(
      "LiquidityCompleteERC721"
    )
    liquidityExamples = await LiquidityExamples.deploy()
    await liquidityExamples.deployed()
    console.log(
      `The liquidity uniswapv3 contract address is: ${liquidityExamples.address}`
    )
    straCost = "100000000" //100
    strategy = await ethers.getContractFactory("FijaStrategyERC721")
    stra = await strategy.deploy(straCost, liquidityExamples.address)
    await stra.deployed()
    console.log(`The strategy address is: ${stra.address}`)
    daiWhale = await ethers.getSigner(DAI_WHALE)
    usdcWhale = await ethers.getSigner(USDC_WHALE)
    usdtWhale = await ethers.getSigner(USDT_WHALE)
  })

  it("should unlock whale accounts and send funds to us", async () => {
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

    const l = await dai
      .connect(daiWhale)
      .transfer(accounts[0].address, daiAmount)

    const t = await usdc
      .connect(usdcWhale)
      .transfer(accounts[0].address, usdcAmount)

    const tt = await usdt
      .connect(usdtWhale)
      .transfer(accounts[0].address, usdtAmount)
    // const balUSDT = usdt.balanceOf(accounts[0].address)
    console.log("Transfered stable coins from whales to our wallet")
  })

  it("Should transfer funds from us to uniswap contract/s", async () => {
    //CHANGE STRATEGY COST TO 6 DECIMALS BECAUSE USDC USES 6 DECIMALS
    // // const straCost = ethers.utils.parseEther("100") //100
    // const straCost = "100000000" //100
    // const daiAmount = ethers.utils.parseEther("300") //100
    // //beacuse it just has 6 decimals
    // const usdcAmount = "300000000" //original: 100000000
    // const usdtAmount = "300000000"

    await dai
      .connect(accounts[0])
      .transfer(liquidityExamples.address, daiAmount)
    await usdc
      .connect(accounts[0])
      .transfer(liquidityExamples.address, usdcAmount)
    const u = await usdt
      .connect(accounts[0])
      .transfer(liquidityExamples.address, usdtAmount)
    await u.wait()
    console.log("Transfered stable coins from us to the Uniswap contract")

    const approval = await usdc.approve(stra.address, straCost)
    await usdc.approve(liquidityExamples.address, usdcAmount)
    await usdt.approve(liquidityExamples.address, usdtAmount)
    await dai.approve(liquidityExamples.address, daiAmount)

    console.log(
      "approved stable coin spending from us to the uniswapv3 liquidity contract"
    )
  })

  it("Should get balance before buying", async () => {
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
  })

  it("Should whitelist the collateral (USDC)", async () => {
    // const strategy = await ethers.getContractFactory("FijaStrategyComp")
    // stra = await strategy.deploy(straCost, liquidityExamples.address)
    // await stra.deployed()
    //whitelist collateral
    const wh = await stra.addCollateralToken(USDC)
    console.log("whitelisted collateral for users to invest")
    await wh.wait()
  })

  //**************************************************CHECK WHETHER WE HAVE TO TRANSFER THE FUNDS FROM HERE TO THE USDC/USDT CONTRACT */
  it("Should connect to the whales and send funds to the BUYER or Investor", async () => {
    const t = await usdc
      .connect(usdcWhale)
      .transfer(this.buyer.address, usdcAmount)
  })

  it("Should invest in the strategy", async () => {
    // const strategy = await ethers.getContractFactory("FijaStrategyComp")
    // stra = await strategy.deploy(straCost, liquidityExamples.address)
    // await stra.deployed()
    // const LiquidityExamples = await ethers.getContractFactory(
    //   "LiquidityComplete2"
    // )
    // liquidityExamples = await LiquidityExamples.deploy()
    // await liquidityExamples.deployed()
    const approval = await usdc
      .connect(this.buyer)
      .approve(stra.address, straCost)
    await usdc
      .connect(accounts[0])
      .approve(liquidityExamples.address, usdcAmount)
    await usdt
      .connect(accounts[0])
      .approve(liquidityExamples.address, usdtAmount)
    await usdt
      .connect(accounts[0])
      .allowance(accounts[0].address, liquidityExamples.address)
    await dai.connect(accounts[0]).approve(liquidityExamples.address, daiAmount)
    // const wh = await stra.addCollateralToken(USDC)
    const w = await stra
      .connect(this.buyer.address)
      .invest(this.buyer.address, USDC, straCost)
    // await w.wait()
    console.log("INVESTED PROVIDING LIQUIDITY TO DAI/USDC AND USDC/USDT POOLS")
    // const w = await liquidityExamples.mintNewPosition()
    // await w.wait()
    // console.log("minted")
  })
  //   it("Should be able to withdraw in the strategy", async () => {
  it("Should withdraw any reamining fund in uniswap contract/s", async () => {
    const w = await liquidityExamples.withdrawStuckFunds(
      USDC,
      accounts[0].address
    )
    await w.wait()
    // const i1 = await dai.balanceOf(stra.address)
    // const j1 = ethers.utils.formatEther(i1)
    // console.log("DAI balance after add liquidity", j1)
    // await liquidityExamples.withdrawStuckFunds(USDT, accounts[0].address)
    // await liquidityExamples.withdrawStuckFunds(DAI, accounts[0].address)
    console.log("Remaining funds withdrawn")
    // expect(await usdc.balanceOf(liquidityExamples.address)).to.equal(0)
    // expect(await usdt.balanceOf(liquidityExamples.address)).to.equal(0)
    // expect(await dai.balanceOf(liquidityExamples.address)).to.equal(0)
    const a = (await usdc.balanceOf(liquidityExamples.address)) / 10 ** 6
    console.log("USDC balance after withdraw funds", a)
    const b = (await usdt.balanceOf(liquidityExamples.address)) / 10 ** 6
    console.log("USDT balance after withdraw funds", b)
  })
  //     const strategy = await ethers.getContractFactory("FijaStrategyComp")
  //     stra = await strategy.deploy(straCost, liquidityExamples.address)
  //     await stra.deployed()
  //     const LiquidityExamples = await ethers.getContractFactory(
  //       "LiquidityComplete2"
  //     )
  //     liquidityExamples = await LiquidityExamples.deploy()
  //     await liquidityExamples.deployed()
  //     const approval = await usdc.approve(stra.address, straCost)
  //     await usdc.approve(liquidityExamples.address, usdcAmount)
  //     await usdt.approve(liquidityExamples.address, usdtAmount)
  //     await dai.approve(liquidityExamples.address, daiAmount)
  //     const wh = await stra.addCollateralToken(USDC)
  //     const w = await stra.invest(accounts[0].address, USDC, straCost)
  //     // await w.wait()
  //     console.log("WITHDRAW")
  //     // const w = await liquidityExamples.mintNewPosition()
  //     // await w.wait()
  //     // console.log("minted")
  //   })

  //   console.log(
  //     "*******************OUR BALANCES**************************************"
  //   )
  //   const a = await dai.balanceOf(accounts[0].address)
  //   const b = ethers.utils.formatEther(a)
  //   console.log("DAI balance after add liquidity", b)
  //   const c = (await usdc.balanceOf(accounts[0].address)) / 10 ** 6
  //   console.log("USDC balance after add liquidity", c)
  //   const d = (await usdt.balanceOf(accounts[0].address)) / 10 ** 6
  //   console.log("USDT balance after add liquidity", d)

  //   console.log(
  //     "*******************UNISWAP CONTRACT BALANCES**************************************"
  //   )
  //   const e = await dai.balanceOf(liquidityExamples.address)
  //   const f = ethers.utils.formatEther(e)
  //   console.log("DAI balance after add liquidity", f)
  //   const g = (await usdc.balanceOf(liquidityExamples.address)) / 10 ** 6
  //   console.log("USDC balance after add liquidity", g)
  //   const h = (await usdt.balanceOf(liquidityExamples.address)) / 10 ** 6
  //   console.log("USDT balance after add liquidity", h)

  //   console.log(
  //     "*******************STRATEGY CONTRACT BALANCES**************************************"
  //   )
  //   const i = await dai.balanceOf(stra.address)
  //   const j = ethers.utils.formatEther(i)
  //   console.log("DAI balance after add liquidity", j)
  //   const k = (await usdc.balanceOf(stra.address)) / 10 ** 6
  //   console.log("USDC balance after add liquidity", k)
  //   const l = (await usdt.balanceOf(stra.address)) / 10 ** 6
  //   console.log("USDT balance after add liquidity", l)

  //PASS THE NFT ID
  it("Should get the Liquidity provided for the positions", async () => {
    //pas the positions directly
    const liquidity1 = await liquidityExamples.getLiquidity(368208)
    const liquidity2 = await liquidityExamples.getLiquidity(368209)
    console.log(`Liquidity from USDC/USDT: ${liquidity2 / 10 ** 6}`)
    console.log(`Liquidity from USDC/DAI: ${liquidity1 / 10 ** 12}`)
  })
})
