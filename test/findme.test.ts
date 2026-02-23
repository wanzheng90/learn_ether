import { expect } from "chai";
import { ethers } from "hardhat";

describe("FindMe", function () {
  async function deployFindMe(deployValue: bigint = 0n) {
    const [owner, other] = await ethers.getSigners();
    const FindMe = await ethers.getContractFactory("FindMe", owner);
    const findMe = await FindMe.deploy({ value: deployValue });
    await findMe.waitForDeployment();
    return { findMe, owner, other };
  }

  it("sets deployer as owner", async function () {
    const { findMe, owner } = await deployFindMe();
    expect(await findMe.owner()).to.equal(owner.address);
  });

  it("accepts ETH in payable constructor", async function () {
    const oneEther = ethers.parseEther("1");
    const { findMe } = await deployFindMe(oneEther);

    expect(await ethers.provider.getBalance(await findMe.getAddress())).to.equal(
      oneEther,
    );
  });

  it("returns empty user list initially", async function () {
    const { findMe } = await deployFindMe();
    const users = await findMe.findAll();

    expect(users.length).to.equal(0);
  });

  it("accepts donation and records user", async function () {
    const { findMe, other } = await deployFindMe();
    const amount = ethers.parseEther("0.1");

    await expect(findMe.connect(other).fund({ value: amount })).to.not.be.reverted;

    const users = await findMe.findAll();
    expect(users.length).to.equal(1);
    expect(users[0].userAddress).to.equal(other.address);
    expect(users[0].amount).to.equal(amount);
  });

  it("reverts when donation is below min amount", async function () {
    const { findMe, other } = await deployFindMe();

    await expect(
      findMe.connect(other).fund({ value: ethers.parseEther("0.0001") }),
    ).to.be.revertedWith("Minimum donation is 0.001 ETH");
  });

  it("reverts when non-owner calls withdraw", async function () {
    const { findMe, other } = await deployFindMe(ethers.parseEther("1"));

    await expect(
      (findMe.connect(other) as typeof findMe).withdraw(),
    ).to.be.revertedWith("Only the owner can withdraw");
  });

  it("allows owner to withdraw all funds and clears donors", async function () {
    const { findMe, owner, other } = await deployFindMe();

    await findMe.connect(other).fund({ value: ethers.parseEther("0.2") });
    await findMe.connect(owner).fund({ value: ethers.parseEther("0.1") });

    await expect(findMe.connect(owner).withdraw()).to.not.be.reverted;

    expect(await ethers.provider.getBalance(await findMe.getAddress())).to.equal(0);
    expect((await findMe.findAll()).length).to.equal(0);
  });
});
