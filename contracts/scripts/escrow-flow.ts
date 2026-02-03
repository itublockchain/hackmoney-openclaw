/**
 * EscrowX402 akışı: whitelist → deposit → release
 * Tek cüzdan: owner kendini whitelist eder, deposit eder, release eder.
 *
 * .env'de: PRIVATE_KEY, ESCROW_X402_ADDRESS (veya BASE_MAINNET_ESCROW_X402_ADDRESS),
 * RPC (SEPOLIA_RPC_URL veya BASE_MAINNET_RPC_URL), CHAIN=sepolia | base_mainnet
 *
 * Kullanım: bun run scripts/escrow-flow.ts
 */
import "dotenv/config";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getContractAddress } from "../lib/envAddresses.js";

const CHAIN = process.env.CHAIN ?? "sepolia";
const RPC_URL =
  CHAIN === "base_mainnet"
    ? process.env.BASE_MAINNET_RPC_URL
    : process.env.SEPOLIA_RPC_URL;
const ESCROW_ADDRESS =
  getContractAddress(CHAIN, "ESCROW_X402") ?? process.env.ESCROW_X402_ADDRESS;

const pk = process.env.PRIVATE_KEY;
if (!pk || !RPC_URL || !ESCROW_ADDRESS) {
  console.error(
    "Eksik .env: PRIVATE_KEY, ESCROW adresi ve RPC URL gerekli (CHAIN=sepolia|base_mainnet)."
  );
  process.exit(1);
}

const chainId = CHAIN === "base_mainnet" ? 8453 : 11155111;
const explorerUrl =
  CHAIN === "base_mainnet"
    ? "https://basescan.org"
    : "https://sepolia.etherscan.io";

const transport = http(RPC_URL);
const account = privateKeyToAccount(pk as `0x${string}`);
const publicClient = createPublicClient({ transport, chain: { id: chainId } });
const walletClient = createWalletClient({
  account,
  transport,
  chain: { id: chainId },
});

const ESCROW_ABI = [
  {
    inputs: [
      { name: "agentAddress", type: "address" },
      { name: "status", type: "bool" },
    ],
    name: "setWhitelistStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "jobId", type: "string" },
      { name: "worker", type: "address" },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "jobId", type: "string" }],
    name: "release",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const jobId = `job-${Date.now()}`;
const depositAmount = parseEther("0.0001");

function txLink(hash: string) {
  return `${explorerUrl}/tx/${hash}`;
}

async function main() {
  const escrow = ESCROW_ADDRESS as `0x${string}`;
  console.log("Network:", CHAIN, "| Escrow:", escrow);
  console.log("Account:", account.address);
  console.log("JobId:", jobId, "\n");

  // 1) Whitelist self
  console.log("1) setWhitelistStatus(owner, true)...");
  const hash1 = await walletClient!.writeContract({
    address: escrow,
    abi: ESCROW_ABI,
    functionName: "setWhitelistStatus",
    args: [account.address, true],
  });
  await publicClient.waitForTransactionReceipt({ hash: hash1 });
  console.log("   Tx:", txLink(hash1), "\n");

  // 2) Deposit (owner deposits, worker = self)
  console.log(
    "2) deposit(jobId, worker) with",
    depositAmount.toString(),
    "wei..."
  );
  const hash2 = await walletClient!.writeContract({
    address: escrow,
    abi: ESCROW_ABI,
    functionName: "deposit",
    args: [jobId, account.address],
    value: depositAmount,
  });
  await publicClient.waitForTransactionReceipt({ hash: hash2 });
  console.log("   Tx:", txLink(hash2), "\n");

  // 3) Release (whitelisted agent = self)
  console.log("3) release(jobId)...");
  const hash3 = await walletClient!.writeContract({
    address: escrow,
    abi: ESCROW_ABI,
    functionName: "release",
    args: [jobId],
  });
  await publicClient.waitForTransactionReceipt({ hash: hash3 });
  console.log("   Tx:", txLink(hash3), "\n");

  console.log("Done. Etherscan tx'ler:");
  console.log("  Whitelist:", txLink(hash1));
  console.log("  Deposit:  ", txLink(hash2));
  console.log("  Release:  ", txLink(hash3));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
