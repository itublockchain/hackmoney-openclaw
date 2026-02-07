import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const L2SubdomainRegistryModule = buildModule("L2SubdomainRegistryModule", (m) => {
  const registry = m.contract("L2SubdomainRegistry");

  return { registry };
});

export default L2SubdomainRegistryModule;
