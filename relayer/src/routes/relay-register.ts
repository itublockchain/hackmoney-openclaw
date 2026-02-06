import express from 'express';
import type { Request, Response } from "express";
import { DELEGATE_ABI } from '../lib';
import type { RelayRequest } from "../lib"
import { encodeFunctionData } from "viem";
import config from '../config';

const router = express.Router();

router.post('/', async (req: Request<{}, {}, RelayRequest>, res: Response) => {
    try {
        const { userAddress, agentURI, metadata, deadline, authorization } = req.body;

        console.log(`[Relayer] İşlem alındı. Kullanıcı: ${userAddress}`);

        // A. Validasyonlar
        if (Date.now() / 1000 > deadline) {
            res.status(400).json({ error: "Deadline expired before submission" });
            return;
        }

        // B. Calldata Oluşturma
        // executeRegister fonksiyonunu encode ediyoruz.
        // Bu data, kullanıcı EOA'sı üzerinde çalışacak.
        const encodedData = encodeFunctionData({
            abi: DELEGATE_ABI,
            functionName: 'executeRegister',
            args: [agentURI, metadata, BigInt(deadline)]
        });

        // C. Authorization Listesi Hazırlama
        // Viem'in sendTransaction formatına uygun hale getiriyoruz.
        // EIP-7702, authorizationList alanını bekler.
        const authorizationList = [
            {
                address: authorization.contractAddress,
                chainId: authorization.chainId,
                nonce: authorization.nonce,
                r: authorization.r,
                s: authorization.s,
                yParity: authorization.yParity
            }
        ];

        // D. İŞLEMİ GÖNDERME (Gas Sponsorluğu Burada)
        console.log("[Relayer] İşlem ağa gönderiliyor...");

        const txHash = await config.walletClient.sendTransaction({
            account: config.account,           // Relayer hesabı (Gas Payer)
            chain: config.chain,               // Added chain explicitly to satisfy type check
            to: userAddress,            // KRİTİK: Hedef, kullanıcının EOA adresidir.
            data: encodedData,          // Çalıştırılacak fonksiyon verisi
            authorizationList: authorizationList, // EIP-7702 Sihiri
            kzg: undefined,             // Blob yoksa undefined (Chain config'e göre değişebilir)
        });

        console.log(`[Relayer] Başarılı! Tx Hash: ${txHash}`);

        // E. Yanıt
        res.status(200).json({
            success: true,
            txHash,
            explorerUrl: `${config.chain.blockExplorers?.default.url}/tx/${txHash}`
        });

    } catch (error: any) {
        console.error("[Relayer Error]", error);

        // Hata ayıklama için detaylı log
        const errorMessage = error.walk ? error.walk().message : error.message;

        res.status(500).json({
            success: false,
            error: "Relay transaction failed",
            details: errorMessage
        });
    }
});

export default router;