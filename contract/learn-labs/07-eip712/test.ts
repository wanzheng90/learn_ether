import { expect } from "chai";
import { ethers } from "hardhat";

async function verifyEip712WithWrongChainIdFails() {
  // YOU IMPLEMENT HERE (about 45 lines)
  // Goal:
  // - deploy EIP712Verifier(name="MailLab", version="1")
  // - prepare Mail struct {from,to,amount,nonce}
  // - sign typed data with correct chainId and verifyAndConsume -> success
  // - sign same message with wrong chainId and call verifyAndConsume -> must fail
  //
  // Hints:
  // - domain fields: name, version, chainId, verifyingContract
  // - types: Mail(from,address,to,address,amount,uint256,nonce,uint256)
  // - signer.signTypedData(domain, types, value)
  // - second call should revert with InvalidSigner
  //
  // Return true only if first succeeds and second fails.
  throw new Error("TODO: implement EIP-712 sign/verify with chainId mismatch check");
}

describe("07 EIP-712", function () {
  it("acceptance: same message fails under wrong chainId", async function () {
    const ok = await verifyEip712WithWrongChainIdFails();
    expect(ok).to.equal(true);
  });
});
