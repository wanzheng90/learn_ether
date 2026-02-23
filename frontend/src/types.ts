// DonationUser 对应 Solidity 里的 struct User
// 由于 Solidity uint256 在前端里会映射成 bigint
export type DonationUser = {
  userAddress: string;
  amount: bigint;
};

// 给 window 扩展类型声明：
// 1) ethereum 来自 MetaMask 注入
// 2) APP_CONFIG 来自 frontend/public/config.js
// 这样 TypeScript 不会报 "属性不存在" 错误
declare global {
  interface Window {
    ethereum?: {
      on: (event: string, listener: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    APP_CONFIG?: {
      contractAddress: string;
      abi: unknown[];
    };
  }
}

export {};
