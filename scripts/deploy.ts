import { ethers } from "hardhat";
import fs from "node:fs";
import path from "node:path";

// 这个脚本做两件事：
// 1) 部署 FindMe 合约
// 2) 把“合约地址 + ABI”写入前端配置文件 frontend/public/config.js
//    这样前端无需手动复制地址
async function main() {
  const FindMe = await ethers.getContractFactory("FindMe");
  const findMe = await FindMe.deploy();
  await findMe.waitForDeployment();

  const address = await findMe.getAddress();
  const abi = FindMe.interface.formatJson();

  const frontendConfigPath = path.join(__dirname, "..", "frontend", "public", "config.js");

  // 注意：这里输出的是一个浏览器可直接加载的 JS 文件
  // 页面通过 window.APP_CONFIG 读取地址和 ABI
  const content = `window.APP_CONFIG = {\n  contractAddress: \"${address}\",\n  abi: ${abi}\n};\n`;

  fs.writeFileSync(frontendConfigPath, content, "utf8");

  console.log(`FindMe deployed to: ${address}`);
  console.log(`Frontend config written to: ${frontendConfigPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
