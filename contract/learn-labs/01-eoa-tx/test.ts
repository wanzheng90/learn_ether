import { expect } from "chai";
import { ethers } from "hardhat";

async function sendThreeWithManualNonceAndRetry() {
  // YOU IMPLEMENT HERE (about 30 lines)
  // Goal:
  // 1) manually read current nonce for sender
  // 2) craft 3 tx objects with nonce, gasLimit, maxFeePerGas, maxPriorityFeePerGas
  // 3) send tx one by one, with simple retry for transient errors
  // 4) return receipts
  //
  // Suggested steps:
  // - const [sender] = await ethers.getSigners();
  // - const startNonce = await ethers.provider.getTransactionCount(sender.address, "latest");
  // - const fee = await ethers.provider.getFeeData();
  // - loop i=0..2 build tx:
  //   { to: sender.address, value: 0n, nonce: startNonce + i, gasLimit: 21000n,
  //     maxFeePerGas: fee.maxFeePerGas ?? ..., maxPriorityFeePerGas: fee.maxPriorityFeePerGas ?? ... }
  // - retry each send up to 3 times if message includes "timeout"/"replacement"/"underpriced"
  // - await tx.wait() and collect receipt
  //
  // Acceptance target:
  // - 3 receipts all status === 1
  // - nonces are continuous and no conflict
  //
  // Keep this block as your practice area.
  // 获取发送者签名
  const [sender, receiver] = await ethers.getSigners();
  const startNonce = await ethers.provider.getTransactionCount(sender.address, "latest");
  const fee = await ethers.provider.getFeeData();
  const receipts = [];
  for (var i = 0; i < 3; i++) {
    const value = ethers.parseEther("0.01");
    const txResp = await sender.sendTransaction({ 
      "to": receiver.address, 
      value,
      "nonce": startNonce,
      "gasLimit":21000n,
      "maxFeePerGas":fee.maxFeePerGas
    });
    const receipt = await txResp.wait(1);
    receipts.push(receipt)
  }
  return receipts;
}

describe("01 EOA transaction minimal", function () {
  it("acceptance: send 3 tx with non-conflicting nonces", async function () {
    const receipts = await sendThreeWithManualNonceAndRetry();
    expect(receipts).to.have.length(3);
    for (const receipt of receipts) {
      expect(receipt?.status).to.equal(1);
    }
  });
});
