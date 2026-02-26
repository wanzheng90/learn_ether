import { expect } from "chai";
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

const checkpointFile = path.resolve("contract/learn-labs/03-event-replay/.checkpoint.json");
const outputFile = path.resolve("contract/learn-labs/03-event-replay/events.json");

type Checkpoint = { fromBlock: number; seenTxLog: string[]; contractAddress?: string };

async function replayWithCheckpoint() {
  // YOU IMPLEMENT HERE (about 35 lines)
  // Goal:
  // - deploy EventReplayLab and emit events
  // - read checkpoint from .checkpoint.json if exists
  // - query logs from [fromBlock, latest]
  // - dedupe by txHash+logIndex
  // - append decoded events to events.json
  // - update checkpoint so rerun does not duplicate
  //
  // Hints:
  // - filter: contract.filters.Ping()
  // - use contract.queryFilter(filter, fromBlock, latest)
  // - id key: `${log.transactionHash}:${log.index}`
  // - decode fields: from, id, message, blockNumber
  // - write JSON files via fs.writeFileSync

  //连接区块链
  const factory = await ethers.getContractFactory("EventReplayLab");
  const checkpoint = fs.existsSync(checkpointFile)
    ? (JSON.parse(fs.readFileSync(checkpointFile, "utf8")) as Checkpoint)
    : ({ fromBlock: 0, seenTxLog: [] } as Checkpoint);

  const contract = checkpoint.contractAddress
    ? factory.attach(checkpoint.contractAddress)
    : await factory.deploy();

  if (!checkpoint.contractAddress) {
    await contract.waitForDeployment();
    await (await contract.ping("hello")).wait();
    await (await contract.ping("world")).wait();
    await (await contract.ping("again")).wait();
  }

  // 查询日志
  const latest = await ethers.provider.getBlockNumber();
  const logs = await contract.queryFilter(contract.filters.Ping(), checkpoint.fromBlock, latest);

  // 处理日志
  const seen = new Set(checkpoint.seenTxLog);
  const events = fs.existsSync(outputFile)
    ? JSON.parse(fs.readFileSync(outputFile, "utf8"))
    : ([] as { from: string; id: number; message: string; blockNumber: number }[]);

  for (const log of logs) {
    const key = `${log.transactionHash}:${log.index}`;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({
      from: log.args.from,
      id: Number(log.args.id),
      message: log.args.message,
      blockNumber: log.blockNumber,
    });
  }

  fs.writeFileSync(outputFile, JSON.stringify(events, null, 2));
  fs.writeFileSync(
    checkpointFile,
    JSON.stringify(
      {
        fromBlock: latest + 1,
        seenTxLog: [...seen],
        contractAddress: await contract.getAddress(),
      },
      null,
      2
    )
  );

  return events.length;
}

describe("03 Event replay", function () {
  beforeEach(function () {
    if (fs.existsSync(checkpointFile)) fs.unlinkSync(checkpointFile);
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
  });

  it("acceptance: can resume without duplicate events", async function () {
    const firstCount = await replayWithCheckpoint();
    const secondCount = await replayWithCheckpoint();
    expect(firstCount).to.be.greaterThan(0);
    expect(secondCount).to.equal(firstCount);
  });
});
