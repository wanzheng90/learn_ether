# 05 - 重入与 CEI

## Goal
构建可攻击版/防护版对照，验证攻击脚本 A 成功、B 失败。

## Acceptance
`VulnerableVault` 被攻击成功；`SafeVault` 攻击失败或无法多提资金。

## How to run
```bash
npx hardhat test contract/learn-labs/05-reentrancy/test.ts
```
实现位置：`test.ts` 中 `YOU IMPLEMENT HERE`。

## 3 个常见失败场景与定位
1. A 也攻击失败：攻击合约 `receive()` 未重入或 maxSteps 太小。
2. B 被攻破：你可能绕过了 nonReentrant 或效果-交互顺序写反。
3. 结果不稳定：余额判断口径不一致。固定对比前后 vault 余额。
