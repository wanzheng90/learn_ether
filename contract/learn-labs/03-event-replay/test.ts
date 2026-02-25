import { expect } from "chai";
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

const checkpointFile = path.resolve("contract/learn-labs/03-event-replay/.checkpoint.json");
const outputFile = path.resolve("contract/learn-labs/03-event-replay/events.json");

type Checkpoint = { fromBlock: number; seenTxLog: string[] };

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
  //
  // Keep this block for your implementation practice.
  throw new Error("TODO: implement event replay and checkpoint resume");
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
