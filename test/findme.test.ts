import { expect } from "chai";
import { ethers } from "hardhat";

const DUMMY_KEY_HASH =
  "0x6c3699283bda56ad74f6b855546325b68d482e983852a54f9d7f2f90d6d5f3f9";

describe("FindMe (VRF)", function () {
  async function deployFindMe(deployValue: bigint = 0n) {
    const [owner, other] = await ethers.getSigners();

    const MockVRFCoordinator = await ethers.getContractFactory(
      "MockVRFCoordinator",
      owner,
    );
    const coordinator = await MockVRFCoordinator.deploy();
    await coordinator.waitForDeployment();

    const FindMe = await ethers.getContractFactory("FindMe", owner);
    const findMe = await FindMe.deploy(
      await coordinator.getAddress(),
      1n,
      DUMMY_KEY_HASH,
      3,
      500_000,
      { value: deployValue },
    );
    await findMe.waitForDeployment();

    return { findMe, coordinator, owner, other };
  }

  async function donateAndFulfill(
    findMe: Awaited<ReturnType<typeof deployFindMe>>["findMe"],
    coordinator: Awaited<ReturnType<typeof deployFindMe>>["coordinator"],
    donor: Awaited<ReturnType<typeof ethers.getSigners>>[0],
    amount: bigint,
    randomWord: bigint,
  ) {
    const donateTx = await findMe.connect(donor).fund({ value: amount });
    const donateReceipt = await donateTx.wait();
    expect(donateReceipt).to.not.equal(null);

    const requestLogs = await findMe.queryFilter(
      findMe.filters.DonationRequested(),
      donateReceipt!.blockNumber,
      donateReceipt!.blockNumber,
    );
    expect(requestLogs.length).to.equal(1);

    const requestId = requestLogs[0].args.requestId;
    await coordinator.fulfillRequest(requestId, randomWord);

    const processedLogs = await findMe.queryFilter(findMe.filters.DonationProcessed());
    return processedLogs[processedLogs.length - 1].args;
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

  it("creates pending donation before VRF fulfillment", async function () {
    const { findMe, other } = await deployFindMe();
    const amount = ethers.parseEther("0.1");

    const tx = await findMe.connect(other).fund({ value: amount });
    const receipt = await tx.wait();
    const logs = await findMe.queryFilter(
      findMe.filters.DonationRequested(),
      receipt!.blockNumber,
      receipt!.blockNumber,
    );
    const requestId = logs[0].args.requestId;

    expect(await findMe.pendingDonationCount()).to.equal(1);
    const pending = await findMe.pendingDonations(requestId);
    expect(pending.donor).to.equal(other.address);
    expect(pending.grossAmount).to.equal(amount);
  });

  it("fulfills donation and records net amount", async function () {
    const { findMe, coordinator, other } = await deployFindMe();
    const amount = ethers.parseEther("0.1");
    const randomWord = 1234n;

    const event = await donateAndFulfill(
      findMe,
      coordinator,
      other,
      amount,
      randomWord,
    );

    expect(event.donor).to.equal(other.address);
    expect(event.grossAmount).to.equal(amount);
    expect(event.refundBps).to.equal(1234n % 3001n);
    expect(event.netAmount + event.refundAmount).to.equal(amount);
    expect(await findMe.pendingDonationCount()).to.equal(0);

    const users = await findMe.findAll();
    expect(users.length).to.equal(1);
    expect(users[0].userAddress).to.equal(other.address);
    expect(users[0].amount).to.equal(event.netAmount);
  });

  it("keeps contract balance as deployValue + net donation", async function () {
    const deployValue = ethers.parseEther("1");
    const { findMe, coordinator, other } = await deployFindMe(deployValue);
    const amount = ethers.parseEther("0.2");

    const event = await donateAndFulfill(findMe, coordinator, other, amount, 1n);
    expect(await ethers.provider.getBalance(await findMe.getAddress())).to.equal(
      deployValue + event.netAmount,
    );
  });

  it("reverts when donation is below min amount", async function () {
    const { findMe, other } = await deployFindMe();

    await expect(
      findMe.connect(other).fund({ value: ethers.parseEther("0.0001") }),
    ).to.be.revertedWith("Minimum donation is 0.001 ETH");
  });

  it("reverts when non-coordinator fulfills", async function () {
    const { findMe, other } = await deployFindMe();
    await expect(
      findMe.connect(other).fulfillRandomWords(1, [123]),
    ).to.be.revertedWith("Only coordinator can fulfill");
  });

  it("reverts when non-owner calls withdraw", async function () {
    const { findMe, other } = await deployFindMe(ethers.parseEther("1"));
    await expect(findMe.connect(other).withdraw()).to.be.revertedWith(
      "Only the owner can withdraw",
    );
  });

  it("blocks withdraw while there are pending donations", async function () {
    const { findMe, owner, other } = await deployFindMe();
    await findMe.connect(other).fund({ value: ethers.parseEther("0.2") });

    await expect(findMe.connect(owner).withdraw()).to.be.revertedWith(
      "Pending VRF donations exist",
    );
  });

  it("allows owner to withdraw after all fulfillments", async function () {
    const { findMe, coordinator, owner, other } = await deployFindMe(
      ethers.parseEther("0.5"),
    );

    await donateAndFulfill(
      findMe,
      coordinator,
      other,
      ethers.parseEther("0.2"),
      42n,
    );
    await donateAndFulfill(
      findMe,
      coordinator,
      owner,
      ethers.parseEther("0.1"),
      77n,
    );

    await expect(findMe.connect(owner).withdraw()).to.not.be.reverted;
    expect(await ethers.provider.getBalance(await findMe.getAddress())).to.equal(0);
    expect((await findMe.findAll()).length).to.equal(0);
  });
});
