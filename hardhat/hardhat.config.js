require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },   
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },   
    ],
  },
  networks: {
    arbitrum_sepolia: {
      url: "https://arb-sepolia.g.alchemy.com/v2/v41N8jePdbYOc5IbvoCMl0VQVHlT1Ja2",
      accounts: ["5a891094c147901e005df00a61bcb1af013d285364f5729e4f4d6df1e0979b10"]
    },
    // for some reason, the sepolia network is not working
    // contract verification is not working
    ethereum_sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/v41N8jePdbYOc5IbvoCMl0VQVHlT1Ja2",
      accounts: ["5a891094c147901e005df00a61bcb1af013d285364f5729e4f4d6df1e0979b10"]
    },
  },
  etherscan: {
    apiKey: {
      arbitrum_sepolia: "4V626DTRUMZ3AQ3N6HTMX15FRNW8S997W1", // Get from https://arbiscan.io/
      ethereum_sepolia: "NUJAA9VPMWH8F98ENH888P8961UE3NUKK5", // Get from https://etherscan.io/
    },
    customChains: [
      {
        network: "arbitrum_sepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io"
        }
      },
      {
        network: "ethereum_sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io"
        }
      }
    ]
  }
};
