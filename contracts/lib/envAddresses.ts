/**
 * Contract adreslerini .env'den [chain]_[CONTRACT_NAME]_ADDRESS formatında okur.
 * Sadece contracts klasörü için geçerli.
 *
 * Örnek: CHAIN=base_mainnet iken BASE_MAINNET_ESCROW_X402_ADDRESS okunur.
 */
export function getContractAddress(
  chain: string,
  contractName: string
): string | undefined {
  const prefix = chain.toUpperCase().replace(/-/g, "_");
  const key = `${prefix}_${contractName}_ADDRESS`;
  return process.env[key];
}

export const CONTRACT_NAMES = [
  "REPUTATION_REGISTRY_CORE",
  "IDENTITY_REGISTRY",
  "ESCROW_X402",
  "REPUTATION_REGISTRY_WRAPPER",
] as const;
