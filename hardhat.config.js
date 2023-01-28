require("@nomiclabs/hardhat-waffle")
require("dotenv").config()
require("@nomiclabs/hardhat-vyper")

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.15",
        settings: {
          evmVersion: "istanbul",
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  vyper: {
    compilers: [{ version: "0.2.1" }, { version: "0.3.0" }],
  },
  networks: {
    hardhat: {
      // forking: {
      // url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.MAINNET_FORK}`,
      // url: "https://arb1.arbitrum.io/rpc",
      // url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_ARBITRUM_KEY}`,
      // url: `${process.env.OPTIMISM_KEY}`,
      // url: `https://rpc-mainnet.matic.quiknode.pro`,
      // url: `https://polygon-rpc.com`,
      // url: `https://rpc.ankr.com/polygon`,
      // url: `https://rpc-mainnet.maticvigil.com`,
      // url: `${process.env.POLYGON_KEY}`,
      // },
    },
    // arbitrum: {
    //   forking: {
    //     url: "https://arb1.arbitrum.io/rpc",
    //   },
    // },
  },
  // mocha: {
  //   timeout: 100000000,
  // },
}
