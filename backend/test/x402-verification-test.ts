
import { ethers } from "ethers";

async function main() {
    const jobId = "123e4567-e89b-12d3-a456-426614174000";
    const workerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    // ABI for the deposit function
    const iface = new ethers.Interface([
        "function deposit(string jobId, address worker)",
    ]);

    // Create a transaction data ensuring jobId matches
    const data = iface.encodeFunctionData("deposit", [jobId, workerAddress]);

    console.log("Encoded Data:", data);

    // Decode it back to verify manually
    const decoded = iface.decodeFunctionData("deposit", data);
    console.log("Decoded Job ID:", decoded.jobId);

    if (decoded.jobId === jobId) {
        console.log("✅ Verification Logic Correct: Job ID matches.");
    } else {
        console.log("❌ Verification Logic Failed.");
    }

    // Test specific logic equivalent to the controller
    const resource = `job:${jobId}`;
    const extractedJobId = resource.split(":")[1];

    if (decoded.jobId !== extractedJobId) {
        console.log("❌ Controller Logic would fail.");
    } else {
        console.log("✅ Controller Logic would pass.");
    }

}

main();
