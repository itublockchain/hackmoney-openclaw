
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OffchainResolverModule = buildModule("OffchainResolverModule", (m) => {
    // CONFIGURATION
    // IMPORTANT: Update these values before deploying to Mainnet!

    // 1. The Gateway URL (Your backend)
    // Use the dev URL as requested by user
    const gatewayUrl = m.getParameter("gatewayUrl", "https://moltlancerdev.batikankutluer.com/api/v1/ens-gateway/{sender}/{data}.json");

    // 2. The Signer Address (Relayer)
    // This should match the RELAYER_PRIVATE_KEY public address in your backend .env
    // For now, we default to the deployer or a placeholder if not provided via parameters.
    // Ideally, pass this as a parameter during deployment.
    const signers = m.getParameter("signers", ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"]); // Default Hardhat Account #0

    const resolver = m.contract("OffchainResolver", [gatewayUrl, signers]);

    return { resolver };
});

export default OffchainResolverModule;
