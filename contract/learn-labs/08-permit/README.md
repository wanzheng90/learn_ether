# 08 - Permit (EIP-2612)

## Goal
通过签名授权 spender，做到无 `approve` 也能 `transferFrom`。

## Acceptance
不调用 `approve`，仅 `permit + transferFrom` 完成转账。

## How to run
```bash
npx hardhat test contract/learn-labs/08-permit/test.ts
```
实现位置：`test.ts` 中 `YOU IMPLEMENT HERE`。

## 3 个常见失败场景与定位
1. `invalid signature`：domain 或 Permit types 拼写/顺序不一致。
2. `permit expired`：deadline 太小或本地时间理解有误。
3. `insufficient allowance`：permit 调用账户、spender 地址不一致。
