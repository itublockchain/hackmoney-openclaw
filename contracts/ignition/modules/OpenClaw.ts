import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * ReputationRegistryWrapper + EscrowX402 tek modülde.
 * Önce wrapper deploy edilir, sonra EscrowX402 wrapper adresiyle deploy edilir.
 */
export default buildModule("OpenClawModule", (m) => {
  const coreAddress = m.getParameter<string>(
    "ReputationRegistryCoreAddress",
    process.env.REPUTATION_REGISTRY_CORE_ADDRESS
  );
  const initialOwner = m.getParameter("InitialOwner", m.getAccount(0));
  const identityRegistry = m.getParameter<string>(
    "IdentityRegistryAddress",
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
