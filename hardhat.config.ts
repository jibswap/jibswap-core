import '@nomiclabs/hardhat-etherscan';
import '@typechain/hardhat';
import '@xyrusworx/hardhat-solidity-json';
import * as dotenv from 'dotenv';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import 'hardhat-gas-reporter';
import { HardhatUserConfig } from 'hardhat/types';
import { getEnvironment, mapLazy } from './utils';

dotenv.config();

const DEPLOYER_PRIVATE_KEY = getEnvironment('DEPLOYER_PRIVATE_KEY');
const accounts = [DEPLOYER_PRIVATE_KEY].map(mapLazy);

if (process.env.VERIFY_CONTRACTS === '1') {
  console.log('VERIFY_CONTRACTS=1. Will verify contracts.');
}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  namedAccounts: {
    deployer: 0,
  },
  networks: {
    hardhat: {
      blockGasLimit: 30_000_000,
    },
    jibchain: {
      url: 'https://rpc-l1.jibchain.net',
      accounts,
      chainId: 8899,
      gasPrice: 1_510_000_000,
    },
  },
  etherscan: {
    apiKey: {
      jibchain: 'abc',
    },
    customChains: [
      {
        network: 'jibchain',
        chainId: 8899,
        urls: {
          apiURL: 'https://exp-l1.jibchain.net/api',
          browserURL: 'https://exp-l1.jibchain.net',
        },
      },
    ],
  },
  solidity: {
    compilers: [
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: false,
            },
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: false,
            },
          },
        },
      },
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
            details: {
              yul: false,
            },
          },
        },
      },
    ],
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  typechain: {
    alwaysGenerateOverloads: true,
    discriminateTypes: true,
    target: 'ethers-v6',
    outDir: './typechain',
  },
};
3;

export default config;
