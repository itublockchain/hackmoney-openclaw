import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { getContractAddress } from "../../lib/envAddresses.js";

/**
 * Mevcut EscrowX402 proxy'yi yeni implementation ile upgrade eder.
 *
 * Kullanım:
 *   CHAIN=base_mainnet hardhat ignition deploy ignition/modules/UpgradeEscrowX402.ts --network baseMainnet
 *
 * .env'de BASE_MAINNET_ESCROW_X402_ADDRESS = proxy adresi olmalı.
 */
export default buildModule("UpgradeEscrowX402Module", (m) => {
  const chain = process.env.CHAIN ?? "base_mainnet";
  const proxyAddress = m.getParameter<string>(
    "EscrowX402ProxyAddress",
    getContractAddress(chain, "ESCROW_X402") ??
      process.env.BASE_MAINNET_ESCROW_X402_ADDRESS ??
      ""
  );

  // 1) Yeni implementation deploy et
  const newImpl = m.contract("EscrowX402", [], { id: "EscrowX402UpgradeImpl" });

  // 2) Proxy'de upgradeToAndCall çağır (owner olmalı)
  const proxy = m.contractAt("EscrowX402", proxyAddress);
  m.call(proxy, "upgradeToAndCall", [newImpl, "0x"], {
    from: m.getAccount(0),
  });

  return { escrowX402Proxy: proxy, newImplementation: newImpl };
});
