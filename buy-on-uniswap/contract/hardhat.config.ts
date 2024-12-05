import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import * as fs from 'fs';
import 'dotenv/config';

const PRIVATE_KEY_TEST_PATH = __dirname + '/test-signing.key';

const config: HardhatUserConfig = {
  solidity: "0.8.27",

  networks: {
    hardhat: {
      // chains: {
      //   137: {
      //     hardforkHistory: {
      //       london: 60_000_000,
      //     },
      //   },
      // },
      // accounts: {
      // 	count: 50,
      // 	mnemonic: 'test test test test test test test test test test test junk',
      // 	path: "m/44'/60'/0'/0",
      // },
      forking: {
        url: `https://base-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
        // url: 'https://polygon-rpc.com',
        // blockNumber: 62798800,// polygon
        //blockNumber: 21259738,// mainnet
        blockNumber: 23290365, // base
      },
      //   gasPrice: 40_000_000_000,
      //   loggingEnabled: true,
    },
    sepolia: {
      url: 'https://ethereum-sepolia.publicnode.com',
      accounts: [
        fs.existsSync(PRIVATE_KEY_TEST_PATH)
          ? fs.readFileSync(PRIVATE_KEY_TEST_PATH).toString().trim()
          : '',
      ],
      gasMultiplier: 1.2,
      timeout: 3600 * 1000,
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      // url: 'https://polygon-rpc.com',
      // gasPrice: 200000000000,
      accounts: [process.env.PRIVATE_KEY_HU ?? ''],
    },
    base: {
      url: `https://base-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
      // url: 'https://polygon-rpc.com',
      // gasPrice: 200000000000,
      accounts: [process.env.PRIVATE_KEY_HU ?? ''],
    },
    // hardhat.config.ts
    polygonAmoy: {
      url: 'https://rpc-amoy.polygon.technology/',
      // accounts: [
      //   fs.existsSync(PRIVATE_KEY_TEST_PATH)
      //     ? fs.readFileSync(PRIVATE_KEY_TEST_PATH).toString().trim()
      //     : '',
      // ],
    },
    baseSepolia: {
      //     "https://base-sepolia-rpc.publicnode.com",
      url: 'https://sepolia.base.org',
      accounts: [process.env.PRIVATE_KEY_HU ?? ""]
    }
  },
  etherscan: {
    apiKey: {
      // API keys must be hidden from public GitHub repo.
      // Possibly we will share repo with others.
      polygon: process.env.POLYGON_API_KEY || '',
      polygonAmoy: process.env.POLYGON_API_KEY || '',
      sepolia: process.env.ETHERSCAN_API_KEY || '',
      baseSepolia: process.env.BASESCAN_API_KEY || '',
      base: process.env.BASESCAN_API_KEY || '',
    },
  },
};

export default config;
