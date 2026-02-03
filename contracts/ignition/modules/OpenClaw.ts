import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { getContractAddress } from "../../lib/envAddresses.js";

/**
 * ReputationRegistryWrapper + EscrowX402 tek modülde.
 * Adresler .env'den [chain]_[CONTRACT_NAME]_ADDRESS formatında okunur (örn. BASE_MAINNET_REPUTATION_REGISTRY_CORE_ADDRESS).
 */
export default buildModule("OpenClawModule", (m) => {
  const chain = process.env.CHAIN ?? "sepolia";
  const coreAddress = m.getParameter<string>(
    "ReputationRegistryCoreAddress",
    getContractAddress(chain, "REPUTATION_REGISTRY_CORE") ??
      process.env.REPUTATION_REGISTRY_CORE_ADDRESS
  );
  const initialOwner = m.getParameter("InitialOwner", m.getAccount(0));
  const identityRegistry = m.getParameter<string>(
    "IdentityRegistryAddress",
    getContractAddress(chain, "IDENTITY_REGISTRY") ??
      process.env.IDENTITY_REGISTRY_ADDRESS
  );

  const wrapper = m.contract("ReputationRegistryWrapper", [coreAddress]);

  const escrow = m.contract("EscrowX402", [
    initialOwner,
    identityRegistry,
    wrapper,
  ]);

  return { reputationRegistryWrapper: wrapper, escrowX402: escrow };
});
