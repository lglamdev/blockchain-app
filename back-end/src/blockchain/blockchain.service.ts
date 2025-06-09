import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { BlockService } from 'src/block/block.service';
import { CreateTransactionDto } from 'src/transaction/dto/create-transaction.dto';
import { Transaction } from 'src/transaction/entities/transaction.entity';
import { TransactionService } from 'src/transaction/transaction.service';


@Injectable()
export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;

    constructor(
        private configService: ConfigService,
        private transactionService: TransactionService,
        private blockService: BlockService,
    ) {
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
            const newTransEntity = await this.saveTransactionEntity(transaction, amountInEther)
            const newBlockEntity = await this.saveBlockEntity(newTransEntity)
            return await transaction.wait()
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

    private async saveTransactionEntity(transactionResponse: ethers.TransactionResponse, amountInEther: string): Promise<Transaction> {
        const newTransDTO: CreateTransactionDto = {
            from: transactionResponse.from,
            to: transactionResponse.to!,
            amount: amountInEther,
        }
        return await this.transactionService.createTransaction(newTransDTO)
    }

    private async saveBlockEntity(transaction: Transaction) {
        const lastBlock = await this.blockService.getLastBlock()
        const previousHash = lastBlock?.hash || '0'

        if (!lastBlock || lastBlock.transactions.length >= 5 || Date.now() - lastBlock.timestamp.getTime() >= 60000) {
            return await this.blockService.createNewBlock()
        } else {
            return await this.blockService.addTransaction(transaction)
        }
    }
}
