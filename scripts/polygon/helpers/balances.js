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
