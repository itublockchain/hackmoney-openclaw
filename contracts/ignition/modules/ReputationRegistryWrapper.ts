import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { getContractAddress } from "../../lib/envAddresses.js";

export default buildModule("ReputationRegistryWrapperModule", (m) => {
  const chain = process.env.CHAIN ?? "sepolia";
  const coreAddress = m.getParameter<string>(
    "ReputationRegistryCoreAddress",
    getContractAddress(chain, "REPUTATION_REGISTRY_CORE") ??
    process.env.REPUTATION_REGISTRY_CORE_ADDRESS
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
