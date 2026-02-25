"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import type { DonationUser } from "@/types";

type Config = {
  contractAddress: string;
  abi: unknown[];
};

const defaultConfig: Config = {
  contractAddress: "",
  abi: [],
};

const getConfig = (): Config => {
  if (typeof window === "undefined") return defaultConfig;
  const cfg = window.APP_CONFIG;
  if (!cfg) return defaultConfig;
  return {
    contractAddress: cfg.contractAddress || "",
    abi: Array.isArray(cfg.abi) ? cfg.abi : [],
  };
};

const shortAddress = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function Home() {
  const config = useMemo(getConfig, []);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState("");
  const [contractBalance, setContractBalance] = useState("-");
  const [donationInput, setDonationInput] = useState("0.001");
  const [donors, setDonors] = useState<DonationUser[]>([]);
  const [status, setStatus] = useState<{ message: string; type: "" | "ok" | "err" }>({
    message: "",
    type: "",
  });

  const hasMetaMask = typeof window !== "undefined" && Boolean(window.ethereum);
  const contractReady = Boolean(config.contractAddress && config.abi.length > 0);

  const setStatusMessage = (message: string, type: "" | "ok" | "err" = "") => {
    setStatus({ message, type });
  };

  const ensureProvider = useCallback((): BrowserProvider | null => {
    if (!window.ethereum) {
      setStatusMessage("未检测到 MetaMask，请先安装 MetaMask。", "err");
      return null;
    }

    if (!provider) {
      const p = new BrowserProvider(window.ethereum);
      setProvider(p);
      return p;
    }

    return provider;
  }, [provider]);

  const loadReadonlyData = useCallback(async () => {
    if (!contractReady) {
      setStatusMessage("合约未配置。请先运行部署脚本生成 frontend/public/config.js", "err");
      return;
    }

    const p = ensureProvider();
    if (!p) return;

    try {
      const readonlyContract = new Contract(config.contractAddress, config.abi, p);
      const [balanceWei, users] = (await Promise.all([
        p.getBalance(config.contractAddress),
        readonlyContract.findAll(),
      ])) as [bigint, DonationUser[]];

      setContractBalance(formatEther(balanceWei));
      setDonors(users || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      setStatusMessage(`读取链上数据失败: ${message}`, "err");
    }
  }, [config.abi, config.contractAddress, contractReady, ensureProvider]);

  const connectWallet = useCallback(async () => {
    if (!contractReady) {
      setStatusMessage("合约未配置。请先运行 npm run deploy:local", "err");
      return;
    }

    const p = ensureProvider();
    if (!p) return;

    try {
      await p.send("eth_requestAccounts", []);
      const signer = await p.getSigner();
      const address = await signer.getAddress();
      const c = new Contract(config.contractAddress, config.abi, signer);

      setAccount(address);
      setContract(c);
      setStatusMessage("钱包连接成功", "ok");
      await loadReadonlyData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      setStatusMessage(`连接钱包失败: ${message}`, "err");
    }
  }, [config.abi, config.contractAddress, contractReady, ensureProvider, loadReadonlyData]);

  const donate = useCallback(async () => {
    if (!contract) {
      setStatusMessage("请先连接 MetaMask", "err");
      return;
    }

    const amount = donationInput.trim();
    if (!amount || Number(amount) <= 0) {
      setStatusMessage("请输入正确的 ETH 数量", "err");
      return;
    }

    try {
      setStatusMessage("捐款交易发送中...");
      const tx = await contract.fund({ value: parseEther(amount) });
      await tx.wait();

      setStatusMessage(`捐款成功，交易哈希: ${tx.hash}`, "ok");
      await loadReadonlyData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      setStatusMessage(`捐款失败: ${message}`, "err");
    }
  }, [contract, donationInput, loadReadonlyData]);

  const withdraw = useCallback(async () => {
    if (!contract) {
      setStatusMessage("请先连接 MetaMask", "err");
      return;
    }

    try {
      setStatusMessage("提现交易发送中...");
      const tx = await contract.withdraw();
      await tx.wait();

      setStatusMessage(`提现成功，交易哈希: ${tx.hash}`, "ok");
      await loadReadonlyData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      setStatusMessage(`提现失败: ${message}`, "err");
    }
  }, [contract, loadReadonlyData]);

  useEffect(() => {
    void loadReadonlyData();
  }, [loadReadonlyData]);

  useEffect(() => {
    if (!window.ethereum?.on) return;

    const handleAccountsChanged = () => window.location.reload();
    const handleChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1>FindMe 捐款</h1>
        <p>Next.js + TypeScript + MetaMask</p>
        <p>
          合约地址: <code>{config.contractAddress || "未配置"}</code>
        </p>
        <p>
          当前账户: <code>{account ? `${shortAddress(account)} (${account})` : "未连接"}</code>
        </p>
        <p>
          合约余额: <strong>{contractBalance}</strong> ETH
        </p>

        <div className="row buttons">
          <button onClick={() => void connectWallet()} disabled={!hasMetaMask || !contractReady}>
            连接 MetaMask
          </button>
          <button className="secondary" onClick={() => void loadReadonlyData()} disabled={!contractReady}>
            刷新状态
          </button>
        </div>

        {status.message && <p className={`status ${status.type}`}>{status.message}</p>}
      </div>

      <div className="card">
        <h2>捐款</h2>
        <div className="row">
          <input
            type="number"
            min="0"
            step="0.001"
            value={donationInput}
            onChange={(e) => setDonationInput(e.target.value)}
            placeholder="输入 ETH 数量（最少 0.001）"
          />
          <button onClick={() => void donate()} disabled={!contract}>
            捐款
          </button>
        </div>
      </div>

      <div className="card">
        <h2>提现（仅 owner）</h2>
        <button className="danger" onClick={() => void withdraw()} disabled={!contract}>
          提现全部
        </button>
      </div>

      <div className="card">
        <h2>捐款人列表</h2>
        <table>
          <thead>
            <tr>
              <th>地址</th>
              <th>捐款 (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {donors.length === 0 ? (
              <tr>
                <td colSpan={2} className="muted">
                  暂无捐款记录
                </td>
              </tr>
            ) : (
              donors.map((item) => (
                <tr key={item.userAddress}>
                  <td title={item.userAddress}>{shortAddress(item.userAddress)}</td>
                  <td>{formatEther(item.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
