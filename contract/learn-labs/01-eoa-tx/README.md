# 01 - EOA 交易发送最小化

## Goal
手写 `nonce / gas` 并加失败重试，确保连续发 3 笔交易不冲突。

## Acceptance
连续发送 3 笔交易，全部 `status=1`，nonce 连续且不冲突。

## How to run
```bash
npx hardhat test contract/learn-labs/01-eoa-tx/test.ts
```
实现位置：`test.ts` 中 `YOU IMPLEMENT HERE`。

## 3 个常见失败场景与定位
1. `nonce too low`：你可能重复使用 nonce。先打印 `startNonce` 和每笔 nonce。
2. `replacement transaction underpriced`：同 nonce 重发时 gas 提升不够。提高 `maxFeePerGas`。
3. 交易长时间 pending：fee 太低或网络拥塞。打印 `feeData` 并提高优先费。
