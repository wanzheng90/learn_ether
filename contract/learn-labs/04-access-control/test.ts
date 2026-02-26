import assert from "node:assert/strict";
import { ethers } from "hardhat";

function extractRevertData(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;
  const e = err as Record<string, unknown>;
  if (typeof e.data === "string") return e.data;
  if (e.data && typeof e.data === "object") {
    const nested = e.data as Record<string, unknown>;
    if (typeof nested.data === "string") return nested.data;
  }
  return undefined;
}

async function assertCustomError(
  txPromise: Promise<unknown>,
  contract: { interface: { parseError: (data: string) => { name: string; args: unknown[] } | null } },
  expectedName: string,
  expectedArgs: unknown[]
) {
  try {
    await txPromise;
    assert.fail(`Expected custom error ${expectedName}, but tx succeeded`);
  } catch (err) {
    const revertData = extractRevertData(err);
    assert.ok(revertData, "Missing revert data");
    const parsed = contract.interface.parseError(revertData!);
    assert.ok(parsed, "Failed to parse custom error");
    assert.equal(parsed!.name, expectedName);
    assert.deepEqual(Array.from(parsed!.args), expectedArgs);
  }
}

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
  const [owner, other, newAdmin] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("AccessControlLab", owner);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const ADMIN_ROLE = await contract.ADMIN_ROLE();

  await assertCustomError(
    contract.connect(other).grantRole(ADMIN_ROLE, await newAdmin.getAddress()),
    contract,
    "NotOwner",
    [await other.getAddress()]
  );

  await assertCustomError(contract.connect(other).adminAction(), contract, "MissingRole", [
    ADMIN_ROLE,
    await other.getAddress(),
  ]);

  await contract.grantRole(ADMIN_ROLE, await newAdmin.getAddress());
  assert.equal(await contract.connect(newAdmin).adminAction(), 42n);

  return true;
}

describe("04 Access control", function () {
  it("acceptance: unauthorized call must fail", async function () {
    const ok = await verifyAccessControl();
    assert.equal(ok, true);
  });
});
