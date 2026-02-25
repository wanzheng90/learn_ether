# 02 - Revert 解析

## Goal
故意触发 revert，并输出可读的 `custom error` 与 `reason string`。

## Acceptance
输出包含 `OnlyEven` 与 `REVERT_REASON_SAMPLE` 的可读信息。

## How to run
```bash
npx hardhat test contract/learn-labs/02-revert-decode/test.ts
```
实现位置：`test.ts` 中 `YOU IMPLEMENT HERE`。

## 3 个常见失败场景与定位
1. 只拿到 `execution reverted`：没有解析 `error.data`。用 `interface.parseError`。
2. reason 为空：不同 provider 返回字段不同，检查 `error.shortMessage/message/data`。
3. 测试卡住：异常未被捕获。给每次故意失败调用加 `try/catch`。
