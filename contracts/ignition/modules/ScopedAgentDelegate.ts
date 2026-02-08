import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ScopedAgentDelegateModule", (m) => {
    const delegate = m.contract("Scoped7702AgentAccount", []);

    return { scoped7702AgentAccount: delegate };
});
