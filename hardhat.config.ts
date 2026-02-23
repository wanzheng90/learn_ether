import "@nomicfoundation/hardhat-toolbox";
import { HardhatUserConfig } from "hardhat/config";

// 从环境变量读取测试网配置：
// SEPOLIA_RPC_URL: 你的 RPC 节点地址（Alchemy/Infura/Ankr 等）
// PRIVATE_KEY: 用于部署的账户私钥（不要泄露，不要提交到 git）
const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL || "";
const privateKey = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.34",
  paths: {
    sources: "./contract",
    tests: "./test",
  },
  networks: {
    // 本地 Hardhat 节点（npx hardhat node）
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // Ethereum Sepolia 测试网
    sepolia: {
      url: sepoliaRpcUrl,
      accounts: privateKey ? [privateKey] : [],
    },
  },
};

export default config;
