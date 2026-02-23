import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.34",
  paths: {
    sources: "./contract",
    tests: "./test",
  },
};

export default config;
