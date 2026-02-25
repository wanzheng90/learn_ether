# Web3 Learn Labs (10 mini projects)

统一技术栈：`Hardhat + ethers`（最小依赖，CLI-only，无前端）。

## 快速开始

```bash
npm run compile
# 单个项目运行：
npx hardhat test contract/learn-labs/01-eoa-tx/test.ts
```

## 目录

1. `01-eoa-tx`：EOA 手写 nonce/gas + retry
2. `02-revert-decode`：revert 原因解析
3. `03-event-replay`：事件监听 + 历史回放 + 断点续跑
4. `04-access-control`：Ownable/Role + 自定义 error
5. `05-reentrancy`：可攻击/不可攻击对照
6. `06-upgradeable`：代理升级后状态保持
7. `07-eip712`：链下签名 + 链上验证 + 错 chainId 失败
8. `08-permit`：EIP-2612 无 approve 的 transferFrom
9. `09-indexer`：最小 Indexer 落盘并去重
10. `10-rpc-fallback`：多 RPC 自动容错
