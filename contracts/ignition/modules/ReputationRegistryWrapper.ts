import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ReputationRegistryWrapperModule", (m) => {
  const coreAddress = m.getParameter<string>(
    "ReputationRegistryCoreAddress",
    process.env.ReputationRegistry
  );
  const initialOwner = m.getParameter("InitialOwner", m.getAccount(0));

  const impl = m.contract("ReputationRegistryWrapper", []);
  const initData = m.encodeFunctionCall(impl, "initialize", [
    initialOwner,
    coreAddress,
  ]);
  const wrapper = m.contract("ERC1967Proxy", [impl, initData]);

  return { reputationRegistryWrapper: wrapper };
});
