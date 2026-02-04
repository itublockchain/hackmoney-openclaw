import "dotenv/config";
import "@nomicfoundation/hardhat-verify";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";
import dotenv from "dotenv";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          viaIR: true,
          optimizer: { enabled: true, runs: 200 },
        },
      },
      production: {
        version: "0.8.28",
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
    npmFilesToBuild: ["@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol"],
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: process.env.SEPOLIA_RPC_URL || configVariable("SEPOLIA_RPC_URL"),
      accounts: privateKey ? [privateKey] : [configVariable("PRIVATE_KEY")],
    },
    baseMainnet: {
      type: "http",
      chainType: "l1",
      url:
        process.env.BASE_MAINNET_RPC_URL ||
        configVariable("BASE_MAINNET_RPC_URL"),
      accounts: privateKey ? [privateKey] : [configVariable("PRIVATE_KEY")],
    },
  },
  // @ts-ignore
  verify: {
    etherscan: {
      apiKey:
        process.env.BASESCAN_API_KEY || configVariable("BASESCAN_API_KEY"),
      enabled: true,
    },
  },
});
