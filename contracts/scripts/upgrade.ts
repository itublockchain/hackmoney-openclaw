/**
 * Upgrade script - mevcut proxy'yi yeni implementation ile günceller.
 *
 * Kullanım:
 *   CONTRACT=EscrowX402 PROXY=0x... bun run hardhat run scripts/upgrade.ts --network baseMainnet
 *   CONTRACT=ReputationRegistryWrapper PROXY=0x... bun run hardhat run scripts/upgrade.ts --network baseMainnet
 *
 * .env'den: CHAIN=base_mainnet, BASE_MAINNET_ESCROW_X402_ADDRESS (proxy adresi)
 *
 * Dikkat: Yeni kontrat aynı storage layout'a sahip olmalı (değişken sırası, __gap).
 */
import "dotenv/config";
import hre from "hardhat";
import { getContractAddress } from "../lib/envAddresses.js";

const UUPS_ABI = [
  {
    name: "upgradeToAndCall",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "newImplementation", type: "address" },
      { name: "data", type: "bytes" },
    ],
  },
] as const;

async function main() {
  const CONTRACT = process.env.CONTRACT ?? "EscrowX402";
  const CHAIN = process.env.CHAIN ?? "base_mainnet";

  const proxyAddress =
    process.env.PROXY ??
    getContractAddress(
      CHAIN,
      CONTRACT === "EscrowX402" ? "ESCROW_X402" : "REPUTATION_REGISTRY_WRAPPER"
    );

  if (!proxyAddress) {
    console.error(
      "PROXY env veya .env'de ESCROW_X402 / REPUTATION_REGISTRY_WRAPPER adresi gerekli (proxy adresi olmalı)"
    );
    process.exit(1);
  }

  const { viem } = await hre.network.connect();

  console.log(`Upgrading ${CONTRACT} proxy at ${proxyAddress}...`);

  // 1) Yeni implementation deploy et
  const impl = await viem.deployContract(CONTRACT, []);
  console.log(`New implementation: ${impl.address}`);

  // 2) Proxy'de upgradeToAndCall çağır (owner olmalısın)
  const [walletClient] = await viem.getWalletClients();
  if (!walletClient) throw new Error("Wallet client not found (PRIVATE_KEY?)");

  const hash = await walletClient.writeContract({
    address: proxyAddress as `0x${string}`,
    abi: UUPS_ABI,
    functionName: "upgradeToAndCall",
    args: [impl.address, "0x" as `0x${string}`],
  });

  const publicClient = await viem.getPublicClient();
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("Upgraded. Tx:", hash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
