# 03 - 事件监听 + 历史回放

## Goal
按区块范围抓事件并落盘，支持断点续跑，不重复写入。

## Acceptance
第一次跑能写入事件；第二次跑不重复入库（数量不增加）。

## How to run
```bash
npx hardhat test contract/learn-labs/03-event-replay/test.ts
```
实现位置：`test.ts` 中 `YOU IMPLEMENT HERE`。

## 3 个常见失败场景与定位
1. 重复事件：缺少 `txHash:logIndex` 去重键。先打印 key。
2. 漏事件：`fromBlock` 记录错。检查 checkpoint 的 block 更新时机。
3. JSON 损坏：并发写文件。先本地串行处理再原子写入。
