import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, TransactionResponse } from 'ethers';
import { BlockService } from 'src/modules/block/block.service';
import { CreateTransactionDto } from 'src/modules/transaction/dto/create-transaction.dto';
import { Transaction } from 'src/database/entities/transaction.entity';
import { TransactionService } from 'src/modules/transaction/transaction.service';
import axios from 'axios';


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

    //transaction sql
    //crawl transactions from block in ethers: all transactions and by contract
    async sendTransaction(to: string, amountInEther: string): Promise<any> {
        try {
            const balance = await this.provider.getBalance(this.wallet.getAddress());
            const amount = ethers.parseEther(amountInEther);
            if (balance < amount) {
                throw new BadRequestException('Insufficient balance to complete the transaction');
            }
            const tx = {
                to,
                value: ethers.parseEther(amountInEther),
                gasLimit: 21000,
            };
            const transaction = await this.wallet.sendTransaction(tx);
            const newTransEntity = await this.saveTransactionEntity(transaction, amountInEther)
            await this.blockService.addTransaction(newTransEntity);
            return await transaction.wait()
        } catch (error: any) {
            console.error('Transaction error:' + error.code, error);
            throw new InternalServerErrorException('Transaction failed. Please check the logs.');
        }
    }
    // constructor(
    //     private configService: ConfigService,
    //     private transactionService: TransactionService,
    //     private blockService: BlockService,
    // ) {
    //     const infuraKey = this.configService.get<string>('INFURA_KEY');

    //     if (!infuraKey) {
    //         throw new Error('INFURA_KEY is not defined in .env');
    //     }

    //     this.provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${infuraKey}`);

    // }
    // async sendTransaction(privateKey: string, to: string, amountInEther: string): Promise<any> {
    //     try {
    //         this.wallet = new ethers.Wallet(privateKey, this.provider);
    //         const tx = {
    //             to,
    //             value: ethers.parseEther(amountInEther),
    //             gasLimit: 21000,
    //         };
    //         const transaction = await this.wallet.sendTransaction(tx);
    //         const newTransEntity = await this.saveTransactionEntity(transaction, amountInEther)
    //         await this.blockService.addTransaction(newTransEntity);
    //         return await transaction.wait()
    //     } catch (error: any) {
    //         console.error('Transaction error:' + error.code, error);
    // throw new InternalServerErrorException('Transaction failed. Please check the logs.');
    //     }
    // }

    async getBalance(address: string): Promise<string> {
        const balanceWei = await this.provider.getBalance(address);
        return ethers.formatEther(balanceWei);
    }

    async getAllTransactionsByContract(contractAddress: string, startBlock = 8588800, endBlock?: number) {
        const latestBlock = endBlock ?? await this.provider.getBlockNumber();
        const result: string[] = [];

        for (let i = startBlock; i <= latestBlock; i++) {
            const block = await this.provider.getBlock(i, true);
            if (!block?.transactions) continue;

            const relatedTxs = block.transactions.filter((tx: any) =>
                tx.to?.toLowerCase() === contractAddress.toLowerCase()
            );
            result.push(...relatedTxs);
        }

        return result;
    }

    // private async getContractAbi(contractAddress: string): Promise<any> {
    //     try {
    //         const etherscanApiKey = this.configService.get<string>('ETHERSCAN_API_KEY')
    //         const url = `https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${etherscanApiKey}`;
    //         const { data } = await axios.get(url)
    //         if (data.status !== '1') {
    //             throw new BadRequestException('Unable to fetch ABI from Etherscan');
    //         }
    //         return JSON.parse(data.result);
    //     } catch (error: any) {
    //         throw new Error(error)
    //     }
    // }

    private async saveTransactionEntity(transactionResponse: ethers.TransactionResponse, amountInEther: string): Promise<Transaction> {
        const newTransDTO: CreateTransactionDto = {
            from: transactionResponse.from,
            to: transactionResponse.to!,
            amount: amountInEther,
        }
        return await this.transactionService.createTransaction(newTransDTO)
    }
}
