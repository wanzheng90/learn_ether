# 04 - 权限控制

## Goal
实现 `owner + role` 控制与自定义 error，验证未授权调用必失败。

## Acceptance
非 owner 授权失败；非 admin 调用失败；授权后可成功调用。

## How to run
```bash
npx hardhat test contract/learn-labs/04-access-control/test.ts
```
实现位置：`test.ts` 中 `YOU IMPLEMENT HERE`。

## 3 个常见失败场景与定位
1. 自定义错误断言失败：可能连错 signer。打印 `msg.sender` 对应账户。
2. role 计算错误：必须从合约读取 `ADMIN_ROLE`，避免本地手算不一致。
3. 授权后仍失败：检查你是否对正确地址执行 `grantRole`。
