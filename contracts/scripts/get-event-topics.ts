import { keccak256, stringToBytes } from "viem";

/**
 * Event topic değerlerini hesaplar.
 * Webhook filtreleme için kullanılır.
 */

// Released(string,address,uint256)
const releasedSignature = "Released(string,address,uint256)";
const releasedTopic = keccak256(stringToBytes(releasedSignature));

console.log("Event Topics:");
console.log("=============");
console.log(`Released: ${releasedTopic}`);
console.log("\nWebhook filter için:");
console.log(`"topics": ["${releasedTopic}"]`);
