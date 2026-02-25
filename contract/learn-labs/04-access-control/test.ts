import { expect } from "chai";
import { ethers } from "hardhat";

async function verifyAccessControl() {
  // YOU IMPLEMENT HERE (about 25 lines)
  // Goal:
  // - deploy AccessControlLab
  // - verify non-owner cannot grant role (custom error NotOwner)
  // - verify non-admin cannot call adminAction (custom error MissingRole)
  // - owner grants ADMIN_ROLE, then adminAction succeeds for new account
  //
  // Hints:
  // - ADMIN_ROLE = await contract.ADMIN_ROLE()
  // - use connect(otherSigner)
  // - custom error assertions:
  //   await expect(tx).to.be.revertedWithCustomError(contract, "NotOwner")
  //
  // Return true if all checks pass.
  throw new Error("TODO: implement role/owner checks");
}

describe("04 Access control", function () {
  it("acceptance: unauthorized call must fail", async function () {
    const ok = await verifyAccessControl();
    expect(ok).to.equal(true);
  });
});
