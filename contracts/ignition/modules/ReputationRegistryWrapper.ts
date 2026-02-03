import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ReputationRegistryWrapperModule", (m) => {
  const coreAddress = m.getParameter<string>(
    "ReputationRegistryCoreAddress",
    process.env.ReputationRegistry
  );

  const wrapper = m.contract("ReputationRegistryWrapper", [coreAddress]);

  return { reputationRegistryWrapper: wrapper };
});
