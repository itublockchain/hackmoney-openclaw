import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { getContractAddress } from "../../lib/envAddresses.js";

/**
 * Updates the existing ReputationRegistryWrapper proxy with the new implementation.
 *
 * Usage:
 *   CHAIN=base_mainnet hardhat ignition deploy ignition/modules/UpgradeReputationRegistryWrapper.ts --network baseMainnet
 *
 * .env must have [CHAIN]_REPUTATION_REGISTRY_WRAPPER_ADDRESS set to the proxy address.
 */
export default buildModule("UpgradeReputationRegistryWrapperModule", (m) => {
    const chain = process.env.CHAIN ?? "sepolia";

    // Retrieve the proxy address from environment variables using the helper
    const proxyAddress = m.getParameter<string>(
        "ReputationRegistryWrapperProxyAddress",
        getContractAddress(chain, "REPUTATION_REGISTRY_WRAPPER") ??
        process.env.REPUTATION_REGISTRY_WRAPPER_ADDRESS ??
        ""
    );

    // 1) Deploy the new implementation
    // using a unique id to avoid collision with previous deployments if any
    const newImpl = m.contract("ReputationRegistryWrapper", [], {
        id: "ReputationRegistryWrapperUpgradeImpl"
    });

    // 2) Call upgradeToAndCall on the proxy (must be owner)
    const proxy = m.contractAt("ReputationRegistryWrapper", proxyAddress);
    m.call(proxy, "upgradeToAndCall", [newImpl, "0x"], {
        from: m.getAccount(0),
    });

    return { reputationRegistryWrapperProxy: proxy, newImplementation: newImpl };
});
