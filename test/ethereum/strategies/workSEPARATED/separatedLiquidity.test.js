const { expect } = require("chai")
const { ethers } = require("hardhat")

//**workssssssssss */

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

describe("LiquidityExamples", () => {
  let liquidityExamples
  let liquidityUSDT
  let accounts
  let dai
  let usdc
  let usdt

  before(async () => {
    accounts = await ethers.getSigners()

    const LiquidityExamples = await ethers.getContractFactory(
      "LiquidityExamples"
    )
    liquidityExamples = await LiquidityExamples.deploy()
    await liquidityExamples.deployed()
    console.log(
      `The liquidity USDC/DAI uniswapv3 contract address is: ${liquidityExamples.address}`
    )

    //second contract
    const LiquidityUSDT = await ethers.getContractFactory("LiquidityUSDT")
    liquidityUSDT = await LiquidityUSDT.deploy()
    await liquidityUSDT.deployed()
    console.log(
      `The liquidity USDC/USDT uniswapv3 contract address is: ${liquidityUSDT.address}`
    )
    // console.log(liquidityUSDT.address)

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
    //this will unlock the whales
    const daiWhale = await ethers.getSigner(DAI_WHALE)
    const usdcWhale = await ethers.getSigner(USDC_WHALE)
    const usdtWhale = await ethers.getSigner(USDT_WHALE)
    // const usdcArWhale = await ethers.getSigner(USDCar_WHALE);
    // const usdtArWhale = await ethers.getSigner(USDTar_WHALE);
    // const daiArWhale = await ethers.getSigner(DAIar_WHALE);

    // Send DAI and USDC to accounts[0]
    //this is equivalent to 100DAI and 100 USDC
    // const daiAmount = 1000n * 10n ** 18n;
    // const usdcAmount = 1000n * 10n ** 6n;
    const daiAmount = ethers.utils.parseEther("100")
    //beacuse it just has 6 decimals
    const usdcAmount = "200000000"
    const usdtAmount = "200000000"
    // const usdtAmount = ethers.utils.parseEther("100");

    // expect(await dai.balanceOf(daiWhale.address)).to.gte(daiAmount);
    // expect(await usdc.balanceOf(usdcWhale.address)).to.gte(usdcAmount);
    // expect(await usdc.balanceOf(usdcArWhale.address)).to.gte(usdcAmount);
    // expect(await dai.balanceOf(daiArWhale.address)).to.gte(daiAmount);
    // expect(await usdt.balanceOf(usdtArWhale.address)).to.gte(usdtAmount);

    const l = await dai
      .connect(daiWhale)
      .transfer(accounts[0].address, daiAmount)

    const t = await usdc
      .connect(usdcWhale)
      .transfer(accounts[0].address, usdcAmount)

    const tt = await usdt
      .connect(usdtWhale)
      .transfer(accounts[0].address, usdtAmount)
    await l.wait()
    await t.wait()
    await tt.wait()
    console.log("Transfered stable coins from whales to our wallet")
  })

  it("mintNewPosition", async () => {
    const daiAmount = 100n * 10n ** 18n
    const usdcAmount = 100n * 10n ** 6n
    const usdtAmount = 100n * 10n ** 6n
    // const daiAmount = ethers.utils.parseEther("100");
    // const usdcAmount = ethers.utils.parseEther("100");

    //sending the dai and the USDC to the liquidity example contract
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
    console.log("Transfered stable coins from us to USDC/DAI contract")

    await usdc.connect(accounts[0]).transfer(liquidityUSDT.address, usdcAmount)
    const ut = await usdt
      .connect(accounts[0])
      .transfer(liquidityUSDT.address, usdtAmount)
    await ut.wait()
    console.log("Transfered stable coins from us to USDC/USDT contract")

    const w = await liquidityExamples.mintNewPosition()
    await w.wait()
    console.log("Provided liquidity USDC/DAI ")

    const x = await liquidityUSDT.mintNewPosition()
    await x.wait()
    console.log("Provided liquidity USDC/USDT ")

    //whatever we do not add as liquidity on the SC, we will be getting a refund, so we are checking that
    console.log(
      "DAI balance after add liquidity",
      await dai.balanceOf(accounts[0].address)
    )
    console.log(
      "USDC balance after add liquidity",
      await usdc.balanceOf(accounts[0].address)
    )
    console.log(
      "USDT balance after add liquidity",
      await usdt.balanceOf(accounts[0].address)
    )
  })

  // before(async () => {
  //   accounts = await ethers.getSigners()

  //   const LiquidityExamples = await ethers.getContractFactory(
  //     "LiquidityExamples2"
  //   )
  //   liquidityExamples = await LiquidityExamples.deploy()
  //   await liquidityExamples.deployed()

  //   dai = await ethers.getContractAt("IERC20", DAI)
  //   usdc = await ethers.getContractAt("IERC20", USDC)
  //   // usdt = await ethers.getContractAt("IERC20", USDT);

  //   // Unlock DAI and USDC whales
  //   await network.provider.request({
  //     method: "hardhat_impersonateAccount",
  //     params: [DAI_WHALE],
  //   })
  //   await network.provider.request({
  //     method: "hardhat_impersonateAccount",
  //     params: [USDC_WHALE],
  //   })
  //   //this will unlock the whales
  //   const daiWhale = await ethers.getSigner(DAI_WHALE)
  //   const usdcWhale = await ethers.getSigner(USDC_WHALE)
  //   // const usdcArWhale = await ethers.getSigner(USDCar_WHALE);
  //   // const usdtArWhale = await ethers.getSigner(USDTar_WHALE);
  //   // const daiArWhale = await ethers.getSigner(DAIar_WHALE);

  //   // Send DAI and USDC to accounts[0]
  //   //this is equivalent to 100DAI and 100 USDC
  //   // const daiAmount = 1000n * 10n ** 18n;
  //   // const usdcAmount = 1000n * 10n ** 6n;
  //   const daiAmount = ethers.utils.parseEther("100")
  //   //beacuse it just has 6 decimals
  //   const usdcAmount = "100000000"
  //   // const usdtAmount = ethers.utils.parseEther("100");

  //   // expect(await dai.balanceOf(daiWhale.address)).to.gte(daiAmount);
  //   // expect(await usdc.balanceOf(usdcWhale.address)).to.gte(usdcAmount);
  //   // expect(await usdc.balanceOf(usdcArWhale.address)).to.gte(usdcAmount);
  //   // expect(await dai.balanceOf(daiArWhale.address)).to.gte(daiAmount);
  //   // expect(await usdt.balanceOf(usdtArWhale.address)).to.gte(usdtAmount);
  //   console.log("hey")
  //   const l = await dai
  //     .connect(daiWhale)
  //     .transfer(accounts[0].address, daiAmount)
  //   console.log("nooo")
  //   const t = await usdc
  //     .connect(usdcWhale)
  //     .transfer(accounts[0].address, usdcAmount)
  //   await l.wait()
  //   await t.wait()
  //   console.log("transfered")
  // })

  // it("mintNewPosition", async () => {
  //   const daiAmount = 100n * 10n ** 18n
  //   const usdcAmount = 100n * 10n ** 6n
  //   // const daiAmount = ethers.utils.parseEther("100");
  //   // const usdcAmount = ethers.utils.parseEther("100");

  //   //sending the dai and the USDC to the liquidity example contract
  //   await dai
  //     .connect(accounts[0])
  //     .transfer(liquidityExamples.address, daiAmount)
  //   await usdc
  //     .connect(accounts[0])
  //     .transfer(liquidityExamples.address, usdcAmount)

  //   await liquidityExamples.mintNewPosition()

  //   //whatever we do not add as liquidity on the SC, we will be getting a refund, so we are checking that
  //   console.log(
  //     "DAI balance after add liquidity",
  //     await dai.balanceOf(accounts[0].address)
  //   )
  //   console.log(
  //     "USDC balance after add liquidity",
  //     await usdc.balanceOf(accounts[0].address)
  //   )
  // })

  //   it.skip("increaseLiquidityCurrentRange", async () => {
  //     const daiAmount = 20n * 10n ** 18n;
  //     const usdcAmount = 20n * 10n ** 6n;

  //     await dai
  //       .connect(accounts[0])
  //       .approve(liquidityExamples.address, daiAmount);
  //     await usdc
  //       .connect(accounts[0])
  //       .approve(liquidityExamples.address, usdcAmount);

  //     await liquidityExamples.increaseLiquidityCurrentRange(
  //       daiAmount,
  //       usdcAmount
  //     );
  //   });

  //   it("decreaseLiquidity", async () => {
  //     const tokenId = await liquidityExamples.tokenId();
  //     const liquidity = await liquidityExamples.getLiquidity(tokenId);

  //     await liquidityExamples.decreaseLiquidity(liquidity);

  //     console.log("--- decrease liquidity ---");
  //     console.log(`liquidity ${liquidity}`);
  //     console.log(`dai ${await dai.balanceOf(liquidityExamples.address)}`);
  //     console.log(`usdc ${await usdc.balanceOf(liquidityExamples.address)}`);
  //   });

  //   it("collectAllFees", async () => {
  //     await liquidityExamples.collectAllFees();

  //     console.log("--- collect fees ---");
  //     console.log(`dai ${await dai.balanceOf(liquidityExamples.address)}`);
  //     console.log(`usdc ${await usdc.balanceOf(liquidityExamples.address)}`);
  //   });
})
