import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import * as fs from 'fs';
import 'dotenv/config';

const PRIVATE_KEY_TEST_PATH = __dirname + '/test-signing-mw.key';
const PRIVATE_KEY_TEST_SIGNER_PATH = __dirname + '/smartcat-prod.key';
//const PRIVATE_KEY_PROD_PATH = __dirname + '/prod-signing.key'; // Used for SmartCatScore contract
const PRIVATE_KEY_PROD_PATH = __dirname + '/prod-loot-signing.key'; // Used for SmartCat Loot contracts


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
        url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
        // url: 'https://polygon-rpc.com',
        // blockNumber: 62798800,// polygon
        blockNumber: 21218123,// mainnet
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
        fs.existsSync(PRIVATE_KEY_TEST_SIGNER_PATH)
          ? fs.readFileSync(PRIVATE_KEY_TEST_SIGNER_PATH).toString().trim()
          : '',
      ],
      gasMultiplier: 1.2,
      timeout: 3600 * 1000,
    },
    polygon: {
      url: 'https://polygon-mainnet.infura.io/v3/3ca8f1ba91f84e1f97c99f6218fe3743',
      // url: 'https://polygon-rpc.com',
      // gasPrice: 200000000000,
      accounts: [process.env.PRIVATE_KEY_PROD ?? ''],
    },
    // hardhat.config.ts
    polygonAmoy: {
      url: 'https://rpc-amoy.polygon.technology/',
      accounts: [
        fs.existsSync(PRIVATE_KEY_TEST_PATH)
          ? fs.readFileSync(PRIVATE_KEY_TEST_PATH).toString().trim()
          : '',
      ],
    },
  },
  etherscan: {
    apiKey: {
      // API keys must be hidden from public GitHub repo.
      // Possibly we will share repo with others.
      polygon: process.env.POLYGON_API_KEY || '',
      polygonAmoy: process.env.POLYGON_API_KEY || '',
      sepolia: process.env.ETHERSCAN_API_KEY || '',
    },
  },
};

export default config;
