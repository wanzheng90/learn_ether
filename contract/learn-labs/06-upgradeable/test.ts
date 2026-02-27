import { expect } from "chai";
import { ethers } from "hardhat";

async function verifyUpgradeStatePersistence() {
  // YOU IMPLEMENT HERE (about 35 lines)
  // Goal:
  // - deploy CounterV1 implementation
  // - deploy proxy pointing to V1
  // - call setValue(7) through proxy
  // - deploy CounterV2 implementation
  // - upgrade proxy to V2
  // - read value through V2 ABI from same proxy address, ensure still 7
  // - call increment(), ensure becomes 8
  //
  // Hints:
  // - encode initData optional, can be "0x"
  // - use ethers.getContractAt("CounterV1", proxyAddress) before upgrade
  // - use ethers.getContractAt("CounterV2", proxyAddress) after upgrade
  //
  // Return final value
  // throw new Error("TODO: implement proxy upgrade and state check");
  
  // 发布CounterV1、CounterV2
  const [admin, receiver] = await ethers.getSigners();
  const proxyFactory = await ethers.getContractFactory("SimpleUpgradeableProxy");

  const counterV1Factory = await ethers.getContractFactory("CounterV1");
  const counterV1 = await counterV1Factory.deploy();
  
  const counterV2Factory = await ethers.getContractFactory("CounterV2");
  const counterV2 = await counterV2Factory.deploy();

  const proxy = await proxyFactory.connect(admin).deploy(counterV1, "0x");
  const counterV1Proxy = await ethers.getContractAt("CounterV1", proxy) 
  const counterV2Proxy = await ethers.getContractAt("CounterV2", proxy) 

  // 发布 SimpleUpgradeableProxy 默认实现为CounterV1 地址，设置7
  await counterV1Proxy.setValue(7n);
  console.log(`counterV1Contract value ${await counterV1Proxy.value()}`)

  // 切换为CounterV2 调用increment
  await proxy.connect(admin).upgradeTo(await counterV2.getAddress());
  await counterV2Proxy.increment();
  console.log(`counterV2Contract value ${await counterV2Proxy.value()}`);
  return await counterV1Proxy.value();
}

describe("06 Upgradeable proxy", function () {
  it("acceptance: state is preserved after upgrade", async function () {
    const finalValue = await verifyUpgradeStatePersistence();
    expect(finalValue).to.equal(8n);
  });
});
