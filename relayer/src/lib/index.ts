
import type { Address, Hex } from "viem";

export const DELEGATE_ABI = [
    {
        "inputs": [
            { "internalType": "string", "name": "agentURI", "type": "string" },
            {
                "components": [
                    { "internalType": "string", "name": "key", "type": "string" },
                    { "internalType": "string", "name": "value", "type": "string" }
                ],
                "internalType": "struct MetadataEntry[]",
                "name": "metadata",
                "type": "tuple[]"
            },
            { "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "executeRegister",
        "outputs": [{ "internalType": "uint256", "name": "agentId", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// Frontend'den beklenen veri yapısı
export interface RelayRequest {
    userAddress: Address; // EOA Adresi
    agentURI: string;
    metadata: { key: string; value: string }[];
    deadline: number;
    // EIP-7702 Yetkilendirme İmzası (Frontend'den gelir)
    authorization: {
        contractAddress: Address; // Delegate Kontrat Adresi
        chainId: number;
        nonce: number;
        r: Hex;
        s: Hex;
        yParity: number; // Viem 'v' yerine yParity kullanabilir, versiyona dikkat
    };
}

