import { Injectable, Logger } from "@nestjs/common";
import { BlockchainService } from "src/blockchain/blockchain.service";
import { Repository } from "typeorm";
import { Block } from "./entities/block.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { createHash } from "crypto";
import { Transaction } from "src/transaction/entities/transaction.entity";
import { endWith } from "rxjs";

@Injectable()
export class BlockService {
    private readonly logger = new Logger(BlockchainService.name)
    private mempool: Transaction[] = []
    private lastBlockTimestamp = Date.now()

    constructor(
        @InjectRepository(Block)
        private readonly blockRepo: Repository<Block>,
        @InjectRepository(Transaction)
        private readonly transRepo: Repository<Transaction>
    ) { }

    async addTransaction(newTransaction: Transaction) {
        try {
            this.mempool.push(newTransaction)
            await this.transRepo.save(newTransaction)

            const currentTime = Date.now()

            if (this.mempool.length > 5 || currentTime - this.lastBlockTimestamp >= 60_000) {
                await this.createNewBlock()
            }
        } catch (error) {
            this.logger.error('Failed to add transaction or create block', error.stack);
            this.mempool = this.mempool.filter(t => t !== newTransaction);
            throw new Error('Internal transaction processing error');
        }
    }

    private async createNewBlock() {
        try {
            const previousBlock = await this.blockRepo.findOne({
                order: { id: 'DESC' },
            })
            const previousHash = previousBlock?.hash || '0'
            const newBlock = new Block()
            newBlock.previousHash = previousHash
            newBlock.timestamp = new Date()
            newBlock.transactions = [...this.mempool]
            newBlock.hash = this.calculateHash(newBlock)

            await this.blockRepo.save(newBlock)

            this.mempool = []
            this.lastBlockTimestamp = Date.now()
        } catch (error) {
            this.logger.error('Failed to create new block', error.stack);
            throw new Error('Block creation failed');
        }

    }

    private calculateHash(block: Block): string {
        try {
            const data = block.previousHash + block.timestamp.toISOString() + JSON.stringify(block.transactions)
            return createHash('sha256').update(data).digest('hex');
        } catch (error) {
            throw new Error('Failed to calculate block hash')
        }
    }
}