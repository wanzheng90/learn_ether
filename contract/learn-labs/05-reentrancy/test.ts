import { expect } from "chai";
import { ethers } from "hardhat";

async function runAttackComparison() {
  // YOU IMPLEMENT HERE (about 40 lines)
  // Goal:
  // - deploy VulnerableVault, SafeVault
  // - fund both vaults (victim deposits)
  // - deploy attacker for each vault and execute attack
  // - Version A (vulnerable): attack should drain > attacker initial deposit
  // - Version B (safe): attack should fail or not drain extra funds
  //
  // Hints:
  // - victim deposit: vault.connect(victim).deposit({ value: ethers.parseEther("5") })
  // - attacker deposit: attacker.attack(maxSteps, { value: ethers.parseEther("1") })
  // - measure vault ETH balance before/after using provider.getBalance(vaultAddress)
  // - safe vault may revert with "reentrant" or keep balance unchanged
  //
  // Return object: { vulnerableDrained: boolean, safeProtected: boolean }
  throw new Error("TODO: implement reentrancy attack A/B comparison");
}

describe("05 Reentrancy vs CEI", function () {
  it("acceptance: attack succeeds on A and fails on B", async function () {
    const result = await runAttackComparison();
    expect(result.vulnerableDrained).to.equal(true);
    expect(result.safeProtected).to.equal(true);
  });
});
