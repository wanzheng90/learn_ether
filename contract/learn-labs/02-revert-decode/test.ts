import { expect } from "chai";
import { ethers } from "hardhat";

async function triggerAndDecodeRevert() {
  // YOU IMPLEMENT HERE (about 25 lines)
  // Goal:
  // - intentionally call mustBeEven(3) and alwaysFails()
  // - decode custom error OnlyEven(uint256)
  // - decode revert reason string REVERT_REASON_SAMPLE
  // - return readable messages
  //
  // Hints:
  // - const factory = await ethers.getContractFactory("RevertLab");
  // - deploy contract
  // - for custom error: use contract.interface.parseError(error.data)
  // - for reason string: provider may return shortMessage/message containing reason
  // - normalize to two readable lines, e.g.:
  //   "OnlyEven: value=3"
  //   "Reason: REVERT_REASON_SAMPLE"
  //
  // Keep this block as your exercise area.
  throw new Error("TODO: implement revert triggering and decoding");
}

describe("02 Revert decoding", function () {
  it("acceptance: print readable custom error and reason", async function () {
    const messages = await triggerAndDecodeRevert();
    expect(messages[0]).to.include("OnlyEven");
    expect(messages[1]).to.include("REVERT_REASON_SAMPLE");
  });
});
