# FindMe 学习项目（Hardhat + Solidity + React + TypeScript + MetaMask）

这个项目适合刚入门 Web3 的同学，用最小代码演示完整流程：
1. 写 Solidity 合约
2. 本地部署合约
3. React 前端连接 MetaMask
4. 在页面上捐款和提现

---

## 1. 项目结构（先看这个）

- `contract/findme.sol`
  - 智能合约：`fund()` 捐款、`withdraw()` 提现、`findAll()` 查询捐款列表
- `scripts/deploy.ts`
  - 部署脚本：部署后自动生成前端配置
- `frontend/src/App.tsx`
  - 前端核心逻辑：连接钱包、读取数据、发交易
- `frontend/public/config.js`
  - 前端配置：合约地址 + ABI（部署脚本自动写入）
- `frontend/vite.config.ts`
  - Vite 前端开发服务器配置

---

## 2. 一次性安装

```bash
npm install
```

---

## 3. 本地运行（按顺序）

### 终端 A：启动本地区块链

```bash
npx hardhat node
```

启动后会打印：
- 测试账户地址（Account #0/#1...）
- 对应私钥（Private Key）

> 这些私钥只用于本地测试，不能用于主网。

### 终端 B：部署合约

```bash
npm run deploy:local
```

这一步会自动更新：`frontend/public/config.js`

### 终端 B：启动前端

```bash
npm run web:dev
```

如果是本机环境，打开：
- `http://127.0.0.1:5173`

如果你在 Codespaces/Gitpod/远程容器：
- 请在 IDE 的 Ports 面板打开 `5173` 对应的公开地址
- 不要直接用你本地电脑的 `127.0.0.1:5173`

---

## 4. MetaMask 配置（本地链）

添加网络：
- Network Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency Symbol: `ETH`

然后导入 `hardhat node` 输出的某个测试私钥。

---

## 5. 页面功能说明

- `连接 MetaMask`
  - 请求钱包授权，拿到当前账户
- `捐款`
  - 调用合约 `fund()`，并附带 ETH
- `提现`
  - 调用 `withdraw()`，仅 owner 成功
- `刷新状态`
  - 重新读取合约余额和捐款列表

---

## 6. 常见问题（新手高频）

### Q1: 访问页面 404

先检查 `vite` 是否真的启动成功，终端应看到：
- `VITE ... ready`
- `Local: http://127.0.0.1:5173/`

再执行：
```bash
curl -I http://127.0.0.1:5173/
```

- `200`：服务正常，可能是你访问地址不对（远程容器时常见）
- `404`：通常是前端根目录配置错误（本项目已在 `frontend/vite.config.ts` 修复）
- 连不上：说明服务没启动

### Q2: `address already in use 8545`

说明已有本地链在跑，二选一：
1. 直接复用已有链
2. 关闭旧进程后再 `npx hardhat node`

### Q3: 提现失败

大概率是当前 MetaMask 账户不是合约 owner（部署者）。

---

## 7. 开发命令

```bash
npm run compile      # 编译合约
npm test             # 运行测试
npm run deploy       # 部署到默认 hardhat 网络
npm run deploy:local # 部署到 localhost:8545
npm run deploy:sepolia # 部署到 sepolia 测试网
npm run web:dev      # 启动前端开发服务器
npm run web:build    # 打包前端
```

---

## 8. Sepolia 部署（测试网）

先准备两个环境变量：
- `SEPOLIA_RPC_URL`：你的 Sepolia RPC 地址
- `PRIVATE_KEY`：部署钱包私钥（0x 开头）

可直接在终端临时设置（示例）：

```bash
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/你的key"
export PRIVATE_KEY="0x你的私钥"
```

然后部署：

```bash
npm run deploy:sepolia
```

注意：
1. 该钱包要有 Sepolia 测试 ETH（可通过 faucet 获取）。
2. 私钥不要提交到 git，不要发给别人。
3. Sepolia 部署成功后，`frontend/public/config.js` 会被更新为 Sepolia 合约地址。

---

## 9. 给你的学习建议（按这个顺序）

1. 先读 `contract/findme.sol` 注释，理解合约状态如何存储。
2. 再读 `scripts/deploy.ts`，理解“为什么前端需要 ABI + 地址”。
3. 最后读 `frontend/src/App.tsx`，重点看三个函数：
   - `connectWallet`
   - `loadReadonlyData`
   - `donate/withdraw`
