# 06 - 可升级代理

## Goal
使用最小代理升级流程，验证升级后状态保持不丢失。

## Acceptance
升级前写入 `value=7`，升级后仍是 7，调用新逻辑后变为 8。

## How to run
```bash
npx hardhat test contract/learn-labs/06-upgradeable/test.ts
```
实现位置：`test.ts` 中 `YOU IMPLEMENT HERE`。

## 3 个常见失败场景与定位
1. 升级后状态丢失：实现合约存储布局不兼容。
2. 调不到新函数：你仍用旧 ABI 连接 proxy 地址。
3. `not admin`：升级调用 signer 错误，必须由 admin 执行。
