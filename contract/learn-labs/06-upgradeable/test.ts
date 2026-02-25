import { expect } from "chai";
import { ethers } from "hardhat";

async function verifyUpgradeStatePersistence() {
  // YOU IMPLEMENT HERE (about 35 lines)
  // Goal:
  // - deploy CounterV1 implementation
  // - deploy proxy pointing to V1
  // - call setValue(7) through proxy
  // - deploy CounterV2 implementation
  // - upgrade proxy to V2
  // - read value through V2 ABI from same proxy address, ensure still 7
  // - call increment(), ensure becomes 8
  //
  // Hints:
  // - encode initData optional, can be "0x"
  // - use ethers.getContractAt("CounterV1", proxyAddress) before upgrade
  // - use ethers.getContractAt("CounterV2", proxyAddress) after upgrade
  //
  // Return final value
  throw new Error("TODO: implement proxy upgrade and state check");
}

describe("06 Upgradeable proxy", function () {
  it("acceptance: state is preserved after upgrade", async function () {
    const finalValue = await verifyUpgradeStatePersistence();
    expect(finalValue).to.equal(8n);
  });
});
