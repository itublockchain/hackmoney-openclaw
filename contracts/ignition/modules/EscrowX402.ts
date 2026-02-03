import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EscrowX402Module", (m) => {
  const initialOwner = m.getParameter("InitialOwner", m.getAccount(0));
  const identityRegistry = m.getParameter<string>(
    "IdentityRegistryAddress",
    process.env.IDENTITY_REGISTRY_ADDRESS
  );
  const reputationRegistry = m.getParameter<string>(
    "ReputationRegistryAddress",
    process.env.REPUTATION_REGISTRY_CORE_ADDRESS
  );

  const escrow = m.contract("EscrowX402", [
    initialOwner,
    identityRegistry,
    reputationRegistry,
  ]);

  return { escrowX402: escrow };
});
