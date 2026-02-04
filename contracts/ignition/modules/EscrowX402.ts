import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("EscrowX402Module", (m) => {
  const initialOwner = m.getParameter("InitialOwner", m.getAccount(0));
  const identityRegistry = m.getParameter<string>(
    "IdentityRegistryAddress",
    process.env.IDENTITY_REGISTRY_ADDRESS
  );
  const reputationRegistry = m.getParameter<string>(
    "ReputationRegistryAddress",
    process.env.REPUTATION_REGISTRY_ADDRESS ??
      process.env.REPUTATION_REGISTRY_CORE_ADDRESS
  );

  const impl = m.contract("EscrowX402", []);
  const initData = m.encodeFunctionCall(impl, "initialize", [
    initialOwner,
    identityRegistry,
    reputationRegistry,
  ]);
  const escrow = m.contract("ERC1967Proxy", [impl, initData]);

  return { escrowX402: escrow };
});
