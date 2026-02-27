import { expect } from "chai";
import { ethers } from "hardhat";

async function verifyEip712WithWrongChainIdFails() {
  const appName = "MailLab";
  const appVersion = "1";

  const [user, recipient] = await ethers.getSigners();

  const eip712VerifierFactory = await ethers.getContractFactory("EIP712Verifier");
  const verifier = await eip712VerifierFactory.deploy(appName, appVersion);

  const chainId = (await ethers.provider.getNetwork()).chainId;

  const correctDomain = {
    name: appName,
    version: appVersion,
    chainId,
    verifyingContract: await verifier.getAddress(),
  };

  const types = {
    Mail: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
  };

  const message = {
    from: await user.getAddress(),
    to: await recipient.getAddress(),
    amount: 100n,
    nonce: 0n,
  };

  const correctSignature = await user.signTypedData(correctDomain, types, message);
  const tx = await verifier.verifyAndConsume(message, correctSignature);
  await tx.wait();

  const wrongDomain = {
    ...correctDomain,
    chainId: chainId + 1n,
  };

  const wrongSignature = await user.signTypedData(wrongDomain, types, {
    ...message,
    nonce: 1n,
  });

try {
  const tx = await verifier.verifyAndConsume(
    { ...message, nonce: 1n },
    wrongSignature
  );
  await tx.wait();
  return false;
} catch (error: any) {
  if(error.revert?.name== "InvalidSigner"){
    return true;
  }
}

  return true;
}

describe("07 EIP-712", function () {
  it("acceptance: same message fails under wrong chainId", async function () {
    const ok = await verifyEip712WithWrongChainIdFails();
    expect(ok).to.equal(true);
  });
});
