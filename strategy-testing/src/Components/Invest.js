import React, { useState } from "react"
import { Card, Navbar, Nav, Button, Form } from "react-bootstrap"
import Web3 from "web3"
import { ethers } from "ethers"
import "../css/style.css"
import Stra from "../artifacts/contracts/ethereum/v3EventBackend/strategy.sol/FijaStrategyEvent.json"
import Uni from "../artifacts/contracts/ethereum/v3EventBackend/uniLiquidity.sol/LiquidityCompleteEvent.json"
// const { ethers } = require("hardhat")

function Invest() {
  const eth = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x1" }],
      })
    } catch (switchError) {
      console.log("Wallet Not Connected")
    }
  }
  const mint = async () => {
    // const provider = new ethers.providers.Web3Provider(window.ethereum)
    // await eth()
    const amount = document.getElementById("amount").value
    console.log(amount)

    // const straAdd = "0x103A3b128991781EE2c8db0454cA99d67b257923"
    // const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    // const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    // const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    // const DAI_WHALE = "0xc61cb8183b7692c8feb6a9431b0b23537a6402b0"
    // // const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2";
    // const USDC_WHALE = "0x42AE1d6A320e93f119d6f136912cfA12f0799B8A"
    // const USDT_WHALE = "0xbe18eae84ef3805fd18c585f7819087f3258b501"

    // //STABLE COINS ARBITRUM
    // const USDTar = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
    // const USDCar = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
    // const DAIar = "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"
    // const USDTar_WHALE = "0xccdead94e8cf17de32044d9701c4f5668ad0bef9"
    // const USDCar_WHALE = "0x62ed28802362bb79ef4cee858d4f7aca5edd0490"
    // const DAIar_WHALE = "0xf6c75d85ef66d57339f859247c38f8f47133bd39"

    // let liquidityExamples
    // let liquidityUSDT
    // let stra
    // let accounts
    // let dai
    // let usdc
    // let usdt
    // let straCost
    // let usdcAmount
    // let usdtAmount
    // let daiAmount
    // let daiWhale
    // let usdcWhale
    // let usdtWhale
    // let LiquidityExamples
    // let strategy
    // accounts = await ethers.getSigners()
    // this.buyer = accounts[1]

    // LiquidityExamples = await ethers.getContractFactory(
    //   "LiquidityCompleteEvent"
    // )
    // liquidityExamples = await LiquidityExamples.deploy()
    // await liquidityExamples.deployed()
    // console.log(
    //   `The liquidity uniswapv3 contract address is: ${liquidityExamples.address}`
    // )
    // straCost = "100000000" //100
    // strategy = await ethers.getContractFactory("FijaStrategyEvent")
    // stra = await strategy.deploy(straCost, liquidityExamples.address)
    // await stra.deployed()
    // console.log(`The strategy address is: ${stra.address}`)
    // daiWhale = await ethers.getSigner(DAI_WHALE)
    // usdcWhale = await ethers.getSigner(USDC_WHALE)
    // usdtWhale = await ethers.getSigner(USDT_WHALE)
    // dai = await ethers.getContractAt("IERC20", DAI)
    // usdc = await ethers.getContractAt("IERC20", USDC)
    // usdt = await ethers.getContractAt("IERC20", USDT)

    // // Unlock DAI and USDC whales
    // await ethers.provider.request({
    //   method: "hardhat_impersonateAccount",
    //   params: [DAI_WHALE],
    // })
    // await ethers.provider.request({
    //   method: "hardhat_impersonateAccount",
    //   params: [USDC_WHALE],
    // })
    // await ethers.provider.request({
    //   method: "hardhat_impersonateAccount",
    //   params: [USDT_WHALE],
    // })

    // daiAmount = ethers.utils.parseEther("300") //100

    // usdcAmount = "800000000" //original: 100000000
    // usdtAmount = "300000000"

    // const l = await dai
    //   .connect(daiWhale)
    //   .transfer(accounts[0].address, daiAmount)

    // const t = await usdc
    //   .connect(usdcWhale)
    //   .transfer(accounts[0].address, usdcAmount)
    // await usdc.connect(usdcWhale).transfer(this.buyer.address, usdcAmount)

    // const tt = await usdt
    //   .connect(usdtWhale)
    //   .transfer(accounts[0].address, usdtAmount)
    // // const balUSDT = usdt.balanceOf(accounts[0].address)
    // console.log("Transfered stable coins from whales to our wallet")

    // const wh = await stra.addCollateralToken(USDC)
    // console.log("whitelisted collateral for users to invest")
    // await wh.wait()

    // const approval = await usdc
    //   .connect(this.buyer)
    //   .approve(stra.address, straCost)
    // await usdc
    //   .connect(accounts[0])
    //   .approve(liquidityExamples.address, usdcAmount)
    // await usdt
    //   .connect(accounts[0])
    //   .approve(liquidityExamples.address, usdtAmount)
    // await usdt
    //   .connect(accounts[0])
    //   .allowance(accounts[0].address, liquidityExamples.address)
    // await dai.connect(accounts[0]).approve(liquidityExamples.address, daiAmount)
    // console.log("approveed")

    // //get the collateral and the address from the front-end
    // const tx = await stra
    //   .connect(this.buyer)
    //   .invest(this.buyer.address, USDC, amount)
    // const receipt = await tx.wait()
    // const event = receipt.events?.filter((x) => {
    //   return x.event == "InvestedStrategy"
    // })
    // // console.log(event)
    // const buyer = event["0"]["args"]["buyer"]
    // const collateral = event["0"]["args"]["collateral"]
    // const value = event["0"]["args"]["value"].toString()
    // console.log(
    //   "*********************USER INVESTED IN FIJA'S STRATEGY********************"
    // )

    // console.log(buyer, collateral, value)

    // //MAKE THE PERCENTAGES
    // const uniUSDC = (value * 20) / 100 / 10 ** 6
    // const uniUSDT = (value * 20) / 100 / 10 ** 6
    // const uniDAI = (value * 20) / 100 / 10 ** 6

    // console.log(uniDAI, uniUSDC, uniUSDT)
    // await dai
    //   .connect(accounts[0])
    //   .transfer(liquidityExamples.address, daiAmount)
    // await usdc
    //   .connect(accounts[0])
    //   .transfer(liquidityExamples.address, usdcAmount)
    // const u = await usdt
    //   .connect(accounts[0])
    //   .transfer(liquidityExamples.address, usdtAmount)
    // await u.wait()
    // console.log("Transfered stable coins from us to the Uniswap contract")

    // const inv = await liquidityExamples
    //   .connect(accounts[0])
    //   .mintNewPosition(uniDAI)
    // const inv2 = await liquidityExamples
    //   .connect(accounts[0])
    //   .mintNewPosition2(uniUSDC)

    // console.log("invested")

    // console.log(batchId);
    // batchIds.push(batchId);
    // await provider.send("eth_requestAccounts", []); // <- this promps user to connect metamask
    // const signer = provider.getSigner()
    // const ninja = new ethers.Contract(NinjaAddr, Ninja.abi, signer)
    // const supply = await ninja.publicMint()
    console.log("minted")
  }

  const goerli = async () => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x5" }],
    })
  }
  const connectWeb3 = async () => {
    const web3 = new Web3(window.ethereum)
    // get all accounts
    const accounts = await web3.eth.getAccounts()
    const user = accounts[0]
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []) // <- this promps user to connect metamask
    const signer = provider.getSigner()
    await eth()
  }
  return (
    <>
      <Button
        style={{
          marginLeft: "6px",
          marginRight: "8px",
          float: "right",
        }}
        className="btn"
        onClick={() => connectWeb3()}
      >
        Connect Wallet
      </Button>
      <Form>
        <Card
          style={{
            // width: "rem80",
            float: "left",
            marginLeft: "60px",
            marginRight: "80px",
            marginTop: "70px",
          }}
        >
          <div
            style={{
              // width: "rem80",
              marginLeft: "25px",
              marginRight: "25px",
              marginTop: "7px",
            }}
          >
            <Card.Title>
              <b>FIJA</b>
            </Card.Title>
            {/* <Card.Img>{background}</Card.Img> */}
            {/* <Card.Img
      src={background}
      height="250"
      width="150"
      marginLeft="10px"
    ></Card.Img> */}
            <Form.Group className="mb-3" controlId="formValue">
              <Form.Label>
                USDC that you want to invest in the strategy
              </Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter amount to invest..."
                id="amount"
                required
              />
              <Form.Text className="text-muted">
                Your keys, your coins, chose DEFI.
              </Form.Text>
              <Button
                //   style={{
                //     marginLeft: "6px",
                //     marginRight: "8px",
                //   }}
                className="btn"
                onClick={() => mint()}
              >
                INVEST
              </Button>
            </Form.Group>
          </div>
        </Card>
      </Form>
    </>
  )
}

export default Invest
