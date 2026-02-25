# 09 - 最小 Indexer

## Goal
监听事件并写入 JSON，重启后不重复入库。

## Acceptance
首次运行写入数据；再次运行不重复插入（总数不变）。

## How to run
```bash
npx hardhat test contract/learn-labs/09-indexer/test.ts
```
实现位置：`test.ts` 中 `YOU IMPLEMENT HERE`。

## 3 个常见失败场景与定位
1. 重启后重复入库：没有维护 `lastProcessedBlock` 或唯一 key。
2. 漏数据：起始区块 +1 逻辑错误，检查边界块处理。
3. 文件不存在崩溃：读取前先处理 `fs.existsSync` 分支。
