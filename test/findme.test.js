const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FindMe", function () {
  async function deployFindMe(deployValue = 0n) {
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
      oneEther
    );
  });

  it("returns empty user list initially", async function () {
    const { findMe } = await deployFindMe();
    const users = await findMe.findAll();

    expect(users.length).to.equal(0);
  });

  it("reverts when non-owner calls withdraw", async function () {
    const { findMe, other } = await deployFindMe(ethers.parseEther("1"));

    await expect(findMe.connect(other).withdraw()).to.be.revertedWith(
      "Only the owner can withdraw"
    );
  });

  it("allows owner to withdraw all funds", async function () {
    const { findMe, owner } = await deployFindMe(ethers.parseEther("1"));

    await expect(findMe.connect(owner).withdraw()).to.not.be.reverted;

    expect(await ethers.provider.getBalance(await findMe.getAddress())).to.equal(0);
  });
});
