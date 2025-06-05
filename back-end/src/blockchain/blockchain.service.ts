import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;

    constructor(private configService: ConfigService) {
        const infuraKey = this.configService.get<string>('INFURA_KEY');
        const privateKey = this.configService.get<string>('PRIVATE_KEY');

        if (!infuraKey || !privateKey) {
            throw new Error('INFURA_KEY or PRIVATE_KEY is not defined in .env');
        }

        this.provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${infuraKey}`);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
    }

    async getBalance(address: string): Promise<string> {
        const balanceWei = await this.provider.getBalance(address);
        return ethers.formatEther(balanceWei);
    }

    async sendTransaction(to: string, amountInEther: string): Promise<any> {
        try {
            const tx = {
                to,
                value: ethers.parseEther(amountInEther),
                gasLimit: 21000,
            };
            const transaction = await this.wallet.sendTransaction(tx);
            return await transaction.wait();
        } catch (error: any) {
            const balance = await this.provider.getBalance(this.wallet.getAddress());
            const amount = ethers.parseEther(amountInEther);
            if (balance < amount) {
                throw new BadRequestException('Insufficient balance to complete the transaction');
            }
            if (error.code === 'INSUFFICIENT_FUNDS') {
                throw new BadRequestException('Not enough ETH to cover the transaction (including gas).');
            } else if (error.code === 'UNCONFIGURED_NAME') {
                throw new BadRequestException('Invalid recipient address');
            } else if (error.code === 'INVALID_ARGUMENT') {
                throw new BadRequestException('Invalid amount.');
            } else {
                console.error('Transaction error:', error);
                throw new InternalServerErrorException('Transaction failed. Please check the logs.');
            }
        }
    }
}
