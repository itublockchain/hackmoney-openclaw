import { http, createPublicClient, createWalletClient } from "viem";
import type { PublicClient, WalletClient, PrivateKeyAccount, Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

type ConfigTYPE = {
  // Server
  PORT: number;
  BACKEND_URL: string;
  RELAYER_PRIVATE_KEY: `0x${string}`;
  API_VERSION: string;
  publicClient: PublicClient;
  walletClient: WalletClient;
  account: PrivateKeyAccount;
  chain: Chain;
  COINBASE_PAYMASTER_URL: string;
  BUNDLER_URL: string;
};

const PORT = Number(process.env.PORT!);
const BACKEND_URL = process.env.BACKEND_URL;
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY as `0x${string}`;
const API_VERSION = process.env.API_VERSION;
const COINBASE_PAYMASTER_URL = process.env.COINBASE_PAYMASTER_URL;
const BUNDLER_URL = COINBASE_PAYMASTER_URL;
const chain = base;

if (!RELAYER_PRIVATE_KEY || !BACKEND_URL || !API_VERSION || !PORT || !COINBASE_PAYMASTER_URL || !BUNDLER_URL) {
  throw new Error("RELAYER_PRIVATE_KEY, BACKEND_URL, API_VERSION, PORT, COINBASE_PAYMASTER_URL or BUNDLER_URL is not defined");
}

const account = privateKeyToAccount(RELAYER_PRIVATE_KEY);

const [publicClient, walletClient] = [createPublicClient({
  chain,
  transport: http()
}), createWalletClient({
  account,
  chain,
  transport: http()
})];

const config = {
  PORT,
  BACKEND_URL,
  RELAYER_PRIVATE_KEY,
  API_VERSION,
  publicClient,
  walletClient,
  account,
  chain,
  COINBASE_PAYMASTER_URL,
  BUNDLER_URL
} as ConfigTYPE;

export default config;
