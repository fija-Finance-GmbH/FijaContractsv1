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
const USDTar_WHALE = "0x88cdd4e3fa3585a364c30d217f6a31c52afa3f1f"
// const USDTar_WHALE = "0xccdead94e8cf17de32044d9701c4f5668ad0bef9"
const USDCar_WHALE = "0x51f6406303c2e33cd8476f9ed8c43256c271d10b"
// const USDCar_WHALE = "0x62ed28802362bb79ef4cee858d4f7aca5edd0490"
const DAIar_WHALE = "0xf6c75d85ef66d57339f859247c38f8f47133bd39"

//OPTIMISM

//STABLE COINS OPTIMISM
const USDTop = "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"
const USDCop = "0x7F5c764cBc14f9669B88837ca1490cCa17c31607"
const DAIop = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"

const USDTop_WHALE = "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"
const USDCop_WHALE = "0xc66825c5c04b3c2ccd536d626934e16248a63f68"
const DAIop_WHALE = "0x03af20bdaaffb4cc0a521796a223f7d85e2aac31"

describe("STRATEGY UNIV3 AND AAVEV3 ARBITRUM", () => {
  let aave
  let accounts
  let dai
  let usdc
  let usdt
  let stra
  let straCost
  let uni

  before(async () => {
    accounts = await ethers.getSigners()
    this.fija = accounts[0]
    this.buyer = accounts[1]
    straCost = "600000000" //600USDC

    const AAVE = await ethers.getContractFactory("AaveV3InteractionAr")
    aave = await AAVE.deploy()
    await aave.deployed()
    console.log(aave.address)
    const UNI = await ethers.getContractFactory("UniswapV3InteractionAr")
    uni = await UNI.deploy()
    await uni.deployed()
    console.log(uni.address)
    const STRA = await ethers.getContractFactory("FijaStrategyTestAr")
    stra = await STRA.deploy(straCost, uni.address, aave.address)
    await stra.deployed()
    console.log(stra.address)

    const daiWhale = await ethers.getSigner(DAIar_WHALE)
    const usdcWhale = await ethers.getSigner(USDCar_WHALE)
    const usdtWhale = await ethers.getSigner(USDTar_WHALE)
    dai = await ethers.getContractAt("IERC20", DAIar)
    usdc = await ethers.getContractAt("IERC20", USDCar)
    usdt = await ethers.getContractAt("IERC20", USDTar)

    // Unlock DAIar and USDCar whales
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAIar_WHALE],
    })
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDCar_WHALE],
    })
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDTar_WHALE],
    })
    //this will unlock the whales

    // const usdcArWhale = await ethers.getSigner(USDCar_WHALE);
    // const usdtArWhale = await ethers.getSigner(USDTar_WHALE);
    // const daiArWhale = await ethers.getSigner(DAIar_WHALE);

    // Send DAIar and USDCar to accounts[0]
    //this is equivalent to 100DAI and 100 USDCar
    // const daiAmount = 1000n * 10n ** 18n;
    // const usdcAmount = 1000n * 10n ** 6n;
    //beacuse it just has 6 decimals
    const daiAmount = ethers.utils.parseEther("800")
    const usdcAmount = "800000000"
    const usdtAmount = "600000000"
    // const usdtAmount = ethers.utils.parseEther("100");

    // expect(await dai.balanceOf(daiWhale.address)).to.gte(daiAmount);
    // expect(await usdc.balanceOf(usdcWhale.address)).to.gte(usdcAmount);
    // expect(await usdc.balanceOf(usdcArWhale.address)).to.gte(usdcAmount);
    // expect(await dai.balanceOf(daiArWhale.address)).to.gte(daiAmount);
    // expect(await usdt.balanceOf(usdtArWhale.address)).to.gte(usdtAmount);
    console.log("TRANSFERING FROM WHALES TO US")
    await dai.connect(daiWhale).transfer(accounts[0].address, daiAmount)
    console.log("dai Transfered")
    await usdc.connect(usdcWhale).transfer(accounts[0].address, usdcAmount)
    console.log("usdc Transfered")
    await usdc.connect(usdcWhale).transfer(accounts[1].address, usdcAmount)
    console.log("usdc Transfered To Buyer")
    await usdt.connect(usdtWhale).transfer(accounts[0].address, usdtAmount)
    console.log("usdt Transfered")

    await stra.connect(accounts[0]).addCollateralToken(USDCar)
    console.log("WHITELISTED COLLATERAL")

    console.log("TRANSFERING FROM US TO UNISWAP CONTRACT ")
    await dai.connect(accounts[0]).transfer(uni.address, daiAmount)
    await usdc.connect(accounts[0]).transfer(uni.address, usdcAmount)
    await usdt.connect(accounts[0]).transfer(uni.address, usdtAmount)
  })

  it("should provide to Uniswap V3 and AAVE V3", async () => {
    const daiAmount = 100n * 10n ** 18n
    const usdcAmount = 100n * 10n ** 6n
    const usdtAmount = 100n * 10n ** 6n
    const daiAave = 300n * 10n ** 18n
    // const daiAave = daiAmount * 2
    console.log(
      `amount to invest: DAI: ${daiAmount}, USDC: ${usdcAmount}, USDT: ${usdtAmount}, DAI AAVE: ${daiAave}`
    )
    // const daiAmount = ethers.utils.parseEther("100");
    // const usdcAmount = ethers.utils.parseEther("100");
    console.log("APPROVING ALL THE SPENDING")
    await usdc.connect(this.buyer).approve(stra.address, straCost)
    await usdc.connect(accounts[0]).approve(uni.address, usdcAmount)
    await dai.connect(accounts[0]).approve(uni.address, daiAmount)
    await usdt.connect(accounts[0]).approve(uni.address, usdtAmount)
    await usdt.connect(accounts[0]).allowance(accounts[0].address, uni.address)
    //   await usdt.connect(accounts[0]).approve(uni.address, usdtAmount)
    console.log("APPROVED")

    describe("Get Balances", () => {
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
        const e1 = await dai.balanceOf(uni.address)
        const f1 = ethers.utils.formatEther(e1)
        console.log("DAI balance after add liquidity", f1)
        const g1 = (await usdc.balanceOf(uni.address)) / 10 ** 6
        console.log("USDC balance after add liquidity", g1)
        const h1 = (await usdt.balanceOf(uni.address)) / 10 ** 6
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
    })
    describe("Invest in the strategy", () => {
      it("should invest in the strategy", async () => {
        const tx = await stra
          .connect(this.buyer)
          .invest(this.buyer.address, USDCar, straCost)
        console.log("READING THE EVENT")
        const receipt = await tx.wait()
        const event = receipt.events?.filter((x) => {
          return x.event == "InvestedStrategy"
        })
        // console.log(event)
        const buyer = event["0"]["args"]["buyer"]
        const collateral = event["0"]["args"]["collateral"]
        const value = event["0"]["args"]["value"].toString()
        console.log(
          "*********************USER DETAILS THAT INVESTED IN FIJA'S STRATEGY********************"
        )
        console.log(buyer, collateral, value)
        const uniUSDC = (value * 20) / 100
        const uniUSDT = (value * 20) / 100
        const uniDAI = (value * 20) / 100 / 10 ** 6
        // const uniDai = ((value * 20) / 100 / 10 ** 6).toString()
        // const uniDAI = ethers.utils.parseEther(uniDai)

        // const uniUSDC = (value * 20) / 100 / 10 ** 6
        // const uniUSDT = (value * 20) / 100 / 10 ** 6
        // const uniDAI = (value * 20) / 100 / 10 ** 6
        console.log(uniDAI, uniUSDC, uniUSDT)

        // const inv = await uni
        //   .connect(accounts[0])
        //   .mintNewPosition(buyer, uniDAI, DAIar, USDCar)
        // await inv.wait()

        await uni
          .connect(accounts[0])
          .mintNewPosition(buyer, uniUSDC, USDCar, USDTar)
        console.log("Minted both position from uniswapV3")

        console.log("TRANSFERING DAI FROM US TO THE AAVE CONTRACT ")
        await dai.connect(accounts[0]).approve(aave.address, daiAave)
        await dai.connect(accounts[0]).transfer(aave.address, daiAave)
        console.log("TRANSFERED ")
        console.log("INVESTING IN AAVE V3")
        await aave.supply(daiAave)
        console.log("INVESTED IN AAVE V3")

        // const x = await uni.mintNewPosition2() // console.log("minted") // await w.wait() // const w = await uni.mintNewPosition()
        // await x.wait()

        //whatever we do not add as liquidity on the SC, we will be getting a refund, so we are checking that

        //export the fucntion as balance of all accounts
        console.log(
          "DAIar balance after add liquidity",
          await dai.balanceOf(accounts[0].address)
        )
        console.log(
          "USDCar balance after add liquidity",
          await usdc.balanceOf(accounts[0].address)
        )
        console.log(
          "USDTar balance after add liquidity",
          await usdt.balanceOf(accounts[0].address)
        )
      })
    })
  })
})
describe("Testing te erc4626 vaut", () => {
  it("should accept the arguments in the constructor", async () => {})
})
