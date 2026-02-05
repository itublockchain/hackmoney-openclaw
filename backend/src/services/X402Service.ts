import config from "@/config";
import { ethers } from "ethers";

export interface PaymentRequiredDetails {
  scheme: string; // "exact" | "range"
  network: string; // e.g. "base", "ethereum"
  chainId?: number;
  amount: string | number;
  asset: string; // "ETH", "USDC"
  tokenAddress?: string;
  resource: string;
  description: string;
  payTo: string; // Contract address
  worker: string; // Worker/Agent address (facilitator)
}

export default class X402Service {
  /**
   * Generates the base64 encoded PAYMENT-REQUIRED header content
   * complying with the X402 payment protocol.
   */
  static generatePaymentHeader(
    details: Omit<
      PaymentRequiredDetails,
      "scheme" | "network" | "asset" | "payTo" | "worker"
    >
  ): string {
    const fullDetails: PaymentRequiredDetails = {
      scheme: "exact",
      network: "base",
      chainId: config.CHAIN_ID,
      asset: "ETH",
      payTo: config.ESCROW_CONTRACT_ADDRESS,
      worker: config.WORKER_ADDRESS,
      ...details,
    };

    // Ensure numeric values are strings to prevent precision loss in JSON
    if (typeof fullDetails.amount === "number") {
      fullDetails.amount = fullDetails.amount.toString();
    }

    return Buffer.from(JSON.stringify(fullDetails)).toString("base64");
  }

  /**
   * Broadcasts a signed transaction to the facilitator or network.
   * In development, it gracefully falls back to mock behavior if the facilitator is unreachable.
   */
  static async broadcastTransaction(signedTx: string): Promise<`0x${string}`> {
    // Basic validation of the signed transaction structure
    try {
      const tx = ethers.Transaction.from(signedTx);
      if (!tx.hash)
        throw new Error("Could not derive hash from signed transaction");
    } catch (e) {
      throw new Error(
        `Invalid signed transaction format: ${e instanceof Error ? e.message : String(e)
        }`
      );
    }

    if (!config.RPC_URL) {
      // Graceful fallback for dev
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ RPC_URL not set in development. Using mock transaction hash.");
        return this.getMockTxHash();
      }
      throw new Error("RPC_URL is not configured");
    }

    try {
      // Direct broadcast via RPC provider
      // console.log(`📡 Broadcasting tx via RPC: ${config.RPC_URL}`);
      const provider = new ethers.JsonRpcProvider(config.RPC_URL);

      const txResponse = await provider.broadcastTransaction(signedTx);
      // console.log(`✅ Faciltiator: Tx broadcasted: ${txResponse.hash}`);

      return txResponse.hash as `0x${string}`;

    } catch (error: any) {
      // Resilience logic ONLY for development environment
      if (
        process.env.NODE_ENV === "development"
      ) {
        console.warn(
          "\x1b[33m%s\x1b[0m",
          `⚠️ Broadcast failed (${error.message}). Returning MOCK hash for development flow.`
        );
        return this.getMockTxHash();
      }

      console.error("❌ X402 Broadcast Error:", error);
      throw error;
    }
  }

  private static getMockTxHash(): `0x${string}` {
    // Generate a consistent dummy hash
    return "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
  }

  private static isNetworkError(error: any): boolean {
    return (
      error.name === "TypeError" || // fetch errors
      error.name === "AbortError" || // timeout
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.message?.includes("fetch") ||
      error.message?.includes("Network request failed") ||
      error.message?.includes("JSON") // JSON parse error on empty response
    );
  }
}
