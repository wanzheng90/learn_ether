export type DonationUser = {
  userAddress: string;
  amount: bigint;
};

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
