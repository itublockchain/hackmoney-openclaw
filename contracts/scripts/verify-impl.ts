/**
 * Upgrade sonrası yeni implementation'ı Basescan'da verify eder.
 * deployed_addresses.json'dan veya IMPL_ADDRESS env'den adres okur.
 *
 * Kullanım: bun run verify:impl:base-mainnet
 */
import "dotenv/config";
import hre from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

function getImplAddress(): string | undefined {
  if (process.env.IMPL_ADDRESS) return process.env.IMPL_ADDRESS;
  try {
    const path = join(
      process.cwd(),
      "ignition/deployments/chain-8453/deployed_addresses.json"
    );
    const data = JSON.parse(readFileSync(path, "utf-8"));
    return data["UpgradeEscrowX402Module#EscrowX402UpgradeImpl"];
  } catch {
    return undefined;
  }
}

async function main() {
  const implAddress = getImplAddress();
  if (!implAddress) {
    console.error(
      "IMPL_ADDRESS env veya ignition/deployments/chain-8453/deployed_addresses.json gerekli"
    );
    process.exit(1);
  }

  console.log("Verifying implementation at", implAddress);

  const verifyTask = hre.tasks.getTask("verify");
  await verifyTask.run({
    address: implAddress,
    constructorArgs: [],
  });
  console.log("Verified:", implAddress);
}

main().catch((e) => {
  const msg = String(e?.message ?? e);
  if (msg.includes("bytecode does not match") || msg.includes("HHE80009")) {
    console.error("\n--- Bytecode uyuşmuyor. Manuel verify ---");
    console.error(
      "1. npx hardhat flatten contracts/ExcrowX402.sol > ExcrowX402_flat.sol"
    );
    console.error(
      "2. https://basescan.org/address/" +
        (getImplAddress() ?? "0x...") +
        "#code"
    );
    console.error("3. Verify and Publish → Solidity (Single file)");
    console.error("4. Compiler: v0.8.28 | Optimization: 200 | Via-IR: Yes");
    console.error("5. Flatten çıktısını yapıştır");
  }
  console.error(e);
  process.exit(1);
});
