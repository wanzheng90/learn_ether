import { expect } from "chai";
import { ethers } from "hardhat";

async function usePermitWithoutApprove() {
  // YOU IMPLEMENT HERE (about 45 lines)
  // Goal:
  // - deploy PermitToken
  // - owner signs permit for spender
  // - spender calls permit(...) on-chain
  // - spender executes transferFrom(owner, recipient, amount) without approve()
  //
  // Hints:
  // - domain: { name: token.name(), version: "1", chainId, verifyingContract: token.address }
  // - type Permit: owner, spender, value, nonce, deadline
  // - parse signature: ethers.Signature.from(sig)
  // - assert recipient balance increased
  //
  // Return transferred amount
  throw new Error("TODO: implement permit + transferFrom flow");
}

describe("08 EIP-2612 Permit", function () {
  it("acceptance: transferFrom works without approve", async function () {
    const amount = await usePermitWithoutApprove();
    expect(amount).to.equal(ethers.parseEther("10"));
  });
});
