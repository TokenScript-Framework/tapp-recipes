import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
require('@openzeppelin/hardhat-upgrades');
require('dotenv/config');

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: 'https://mainnet.infura.io/v3/' + process.env.INFURA_KEY,
        blockNumber: 19652821,
      },
      // loggingEnabled: true
    },
    // "rpc":[
    //   "https://rpc.sepolia.org",
    //   "https://rpc2.sepolia.org",
    //   "https://rpc-sepolia.rockx.com",
    //   "https://rpc.sepolia.ethpandaops.io",
    //   "https://sepolia.infura.io/v3/${INFURA_API_KEY}",
    //   "wss://sepolia.infura.io/v3/${INFURA_API_KEY}",
    //   "https://sepolia.gateway.tenderly.co",
    //   "wss://sepolia.gateway.tenderly.co",
    //   "https://ethereum-sepolia-rpc.publicnode.com",
    //   "wss://ethereum-sepolia-rpc.publicnode.com"]
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
    },
    base: {
      url: `https://base-rpc.publicnode.com`,
    },
    baseSepolia: {
      url: `https://base-sepolia-rpc.publicnode.com`,
    },
    okx: {
      // mainnet
      // https://rpc.xlayer.tech
      // https://xlayerrpc.okx.com
      url: 'https://rpc.xlayer.tech',
      accounts: [process.env.PRIVATE_KEY_ADMIN || ''],
    },
    xlayer: {
      // testnet
      // https://testrpc.xlayer.tech
      // https://xlayertestrpc.okx.com/
      url: 'https://testrpc.xlayer.tech',
      accounts: [process.env.PRIVATE_KEY_ADMIN || ''],
    },
    polygonAmoy: {
      // "https://polygon-amoy-bor-rpc.publicnode.com",
      // "chainId": 80002,
      url: 'https://rpc-amoy.polygon.technology',
      accounts: [process.env.PRIVATE_KEY_ADMIN || ''],
    },
    polygon: {
      // url: 'https://polygon-rpc.com',
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      accounts: [process.env.PRIVATE_KEY_ADMIN || ''],
    },
  },
  etherscan: {
    enabled: true,
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
      mainnet: `${process.env.ETHERSCAN_API_KEY}`,
      sepolia: `${process.env.ETHERSCAN_API_KEY}`,
      base: `${process.env.ETHERSCAN_API_KEY}`,
      baseSepolia: `${process.env.ETHERSCAN_API_KEY}`,
      polygonAmoy: `${process.env.POLYGONSCAN_API_KEY}`,
      polygon: `${process.env.POLYGONSCAN_API_KEY}`,
      xlayer: `${process.env.OKX_API_KEY}`,
      okx: `${process.env.OKX_API_KEY}`,
    },
    customChains: [
      {
        network: 'okx',
        chainId: 196,
        urls: {
          apiURL: 'https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER',
          browserURL: 'https://www.oklink.com/xlayer ',
        },
      },
      {
        network: 'xlayer',
        chainId: 195, //196 for mainnet
        urls: {
          apiURL: 'https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER_TESTNET', //or https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER for mainnet
          browserURL: 'https://www.oklink.com/xlayer-test', //or https://www.oklink.com/xlayer for mainnet
        },
      },
      {
        network: 'polygonAmoy',
        chainId: 80002, //196 for mainnet
        urls: {
          apiURL: 'https://api-amoy.polygonscan.com/api',
          browserURL: 'https://amoy.polygonscan.com/',
        },
      },
      {
        network: 'base',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org/',
        },
      },
      {
        network: 'baseSepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org/',
        },
      },
    ],
  },
};

export default config;
