import { expect } from "chai";
import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

const dbFile = path.resolve("contract/learn-labs/09-indexer/indexer-db.json");

type Row = { key: string; id: string; value: string; blockNumber: number };

async function runIndexerOnceAndPersist() {
  // YOU IMPLEMENT HERE (about 40 lines)
  // Goal:
  // - deploy IndexerSource and emit NumberSet events
  // - read existing db json if exists
  // - query from last processed block + 1
  // - upsert rows by unique key txHash:logIndex
  // - write db json with rows + lastProcessedBlock
  // - rerun should not duplicate existing rows
  //
  // Hints:
  // - db shape: { lastProcessedBlock: number, rows: Row[] }
  // - use Map for dedupe
  // - decode id/value from event args
  //
  // Return row count
  throw new Error("TODO: implement minimal indexer persistence");
}

describe("09 Minimal indexer", function () {
  beforeEach(function () {
    if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  });

  it("acceptance: restart does not insert duplicates", async function () {
    const first = await runIndexerOnceAndPersist();
    const second = await runIndexerOnceAndPersist();
    expect(first).to.be.greaterThan(0);
    expect(second).to.equal(first);
  });
});
