# 10 - 多 RPC 容错

## Goal
实现 RPC 失败自动切换，随机断一个 RPC 仍能完成查询。

## Acceptance
RPC 列表里有一个故障节点时，仍能成功返回区块号。

## How to run
```bash
npx hardhat test contract/learn-labs/10-rpc-fallback/test.ts
```
实现位置：`test.ts` 中 `YOU IMPLEMENT HERE`。

## 3 个常见失败场景与定位
1. 直接抛错不切换：没有 `try/catch` 包裹每个 client。
2. 返回了无效结果：缺少对返回值类型/范围检查。
3. 全部失败时信息不清楚：聚合错误信息，输出每个 RPC 原因。
