# 07 - EIP-712

## Goal
链下签名 + 链上验证，并验证错误 `chainId` 下同消息必失败。

## Acceptance
正确 chainId 的签名验证成功；错误 chainId 的签名验证失败。

## How to run
```bash
npx hardhat test contract/learn-labs/07-eip712/test.ts
```
实现位置：`test.ts` 中 `YOU IMPLEMENT HERE`。

## 3 个常见失败场景与定位
1. 正确签名也失败：domain 字段（name/version/contract/chainId）不一致。
2. nonce 错误：链上 nonce 已消费，签名前先读取最新 nonce。
3. 错 chainId 居然成功：你签名时 domain 没改 chainId。
