import { ethers, network } from "hardhat";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_KEY_HASH =
  "0x6c3699283bda56ad74f6b855546325b68d482e983852a54f9d7f2f90d6d5f3f9";

type VrfConfig = {
  coordinator: string;
  subscriptionId: bigint;
  keyHash: string;
  requestConfirmations: number;
  callbackGasLimit: number;
};

function resolveVrfConfig(): VrfConfig {
  const isLocal = network.name === "hardhat" || network.name === "localhost";

  if (isLocal) {
    return {
      coordinator: "",
      subscriptionId: 1n,
      keyHash: DEFAULT_KEY_HASH,
      requestConfirmations: 3,
      callbackGasLimit: 500_000,
    };
  }

  const coordinator = process.env.VRF_COORDINATOR || "";
  const subscriptionId = process.env.VRF_SUBSCRIPTION_ID || "";
  const keyHash = process.env.VRF_KEY_HASH || "";
  const requestConfirmations = Number(process.env.VRF_REQUEST_CONFIRMATIONS || "3");
  const callbackGasLimit = Number(process.env.VRF_CALLBACK_GAS_LIMIT || "500000");

  if (!coordinator || !subscriptionId || !keyHash) {
    throw new Error(
      "Missing VRF env vars: VRF_COORDINATOR, VRF_SUBSCRIPTION_ID, VRF_KEY_HASH",
    );
  }

  return {
    coordinator,
    subscriptionId: BigInt(subscriptionId),
    keyHash,
    requestConfirmations,
    callbackGasLimit,
  };
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const vrf = resolveVrfConfig();

  if (!vrf.coordinator) {
    const MockVRFCoordinator = await ethers.getContractFactory(
      "MockVRFCoordinator",
      deployer,
    );
    const mock = await MockVRFCoordinator.deploy();
    await mock.waitForDeployment();
    vrf.coordinator = await mock.getAddress();
    console.log(`MockVRFCoordinator deployed to: ${vrf.coordinator}`);
  }

  const FindMe = await ethers.getContractFactory("FindMe", deployer);
  const findMe = await FindMe.deploy(
    vrf.coordinator,
    vrf.subscriptionId,
    vrf.keyHash,
    vrf.requestConfirmations,
    vrf.callbackGasLimit,
  );
  await findMe.waitForDeployment();

  const address = await findMe.getAddress();
  const abi = FindMe.interface.formatJson();
  const frontendConfigPath = path.join(__dirname, "..", "frontend", "public", "config.js");
  const content = `window.APP_CONFIG = {\n  contractAddress: \"${address}\",\n  abi: ${abi}\n};\n`;

  fs.writeFileSync(frontendConfigPath, content, "utf8");
  console.log(`FindMe deployed to: ${address}`);
  console.log(`Frontend config written to: ${frontendConfigPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
