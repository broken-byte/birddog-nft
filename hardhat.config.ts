import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-gas-reporter';

const ALCHEMY_BASE_MAINNET_API_KEY: string = process.env.ALCHEMY_API_KEY!!;
const BASE_ENGINEERING_DEPLOYER_PRIVATE_KEY: string =
  process.env.BASE_ENGINEERING_DEPLOYER_PRIVATE_KEY!!;
const ALCHEMY_BASE_SEPLOYIA_API_KEY: string = process.env.ALCHEMY_BASE_SEPOLIA_API_KEY!!;
const BASESCAN_BASED_WHALE_API_KEY: string = process.env.BASESCAN_BASED_WHALE_API_KEY!!;
const COINMARKETCAP_API_KEY: string = process.env.COINMARKETCAP_API_KEY!!;
const ETHERSCAN_API_KEY: string = process.env.ETHERSCAN_API_KEY!!;

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    hardhat: {
      forking: {
        url: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_BASE_MAINNET_API_KEY}`,
        blockNumber: 17535784,
      },
    },
    // Base Sepolia (testnet)
    sepolia: {
      url: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_BASE_SEPLOYIA_API_KEY}`,
      accounts: [BASE_ENGINEERING_DEPLOYER_PRIVATE_KEY],
    },
    // Base Mainnet
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_BASE_MAINNET_API_KEY}`,
      accounts: [BASE_ENGINEERING_DEPLOYER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      base: BASESCAN_BASED_WHALE_API_KEY,
    },
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },
  gasReporter: {
    currency: 'USD',
    L1: 'ethereum',
    L2: 'base',
    coinmarketcap: COINMARKETCAP_API_KEY,
    L1Etherscan: ETHERSCAN_API_KEY,
    L2Etherscan: BASESCAN_BASED_WHALE_API_KEY,
    darkMode: true,
    enabled: false,
  },
};

export default config;
