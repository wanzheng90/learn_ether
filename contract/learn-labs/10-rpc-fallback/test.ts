import { expect } from "chai";
import { ethers } from "hardhat";

type RpcClient = {
  name: string;
  getBlockNumber: () => Promise<number>;
};

async function fetchBlockNumberWithFallback(clients: RpcClient[]) {
  // YOU IMPLEMENT HERE (about 25 lines)
  // Goal:
  // - try RPC clients in order
  // - if current client fails, log error and continue
  // - return first successful blockNumber
  // - if all fail, throw combined error
  //
  // Hints:
  // - collect errors into string[]
  // - throw new Error(`all rpc failed: ${errors.join(" | ")}`)
  // - this models multi-RPC failover logic used in production
  throw new Error("TODO: implement rpc failover logic");
}

describe("10 RPC fallback", function () {
  it("acceptance: one random RPC down should still succeed", async function () {
    const hardhatClient: RpcClient = {
      name: "hardhat",
      getBlockNumber: async () => Number(await ethers.provider.getBlockNumber()),
    };

    const brokenClient: RpcClient = {
      name: "broken",
      getBlockNumber: async () => {
        throw new Error("connection refused");
      },
    };

    const clients = Math.random() > 0.5 ? [brokenClient, hardhatClient] : [hardhatClient, brokenClient];
    const blockNumber = await fetchBlockNumberWithFallback(clients);
    expect(blockNumber).to.be.a("number");
    expect(blockNumber).to.be.greaterThan(-1);
  });
});
