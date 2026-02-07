import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';

async function main() {
    const txHash = '0x729bad1209dcdc728e41ddc8239d82c2e9b82f1f96a93c4d1f195c17cf9e603d'; // New simple delegation hash

    const client = createPublicClient({
        chain: base,
        transport: http('https://mainnet.base.org')
    });

    console.log(`Checking tx: ${txHash}`);
    const receipt = await client.getTransactionReceipt({ hash: txHash });

    console.log(`Status: ${receipt.status}`);

    if (receipt.status === 'reverted') {
        console.log('Transaction REVERTED.');
        // Try to replay to get reason
        const tx = await client.getTransaction({ hash: txHash });
        try {
            await client.call({
                account: tx.from,
                to: tx.to,
                data: tx.input,
                value: tx.value,
                gas: tx.gas,
                gasPrice: tx.gasPrice,
            });
        } catch (err: any) {
            console.log('Revert Reason:', err.message || err);
            if (err.data) console.log('Revert Data:', err.data);
        }
    } else {
        console.log('Transaction SUCCESS? User says fail.');
    }
}

main();
