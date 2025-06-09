import { Injectable, NotFoundException } from "@nestjs/common";
import { Transaction } from "./entities/transaction.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateTransactionDto } from "./dto/create-transaction.dto";

@Injectable()
export class TransactionService {

    constructor(
        @InjectRepository(Transaction)
        private transactionRepo: Repository<Transaction>,
    ) { }

    async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
        try {
            const newTransaction = this.transactionRepo.create(createTransactionDto)
            if (!newTransaction) {
                console.log("eeeee")
            }
            return await this.transactionRepo.save(newTransaction)
        } catch (error) {
            throw new Error('Transaction can not be saved')
        }
    }

    async findTransactionById(id: number): Promise<Transaction> {
        const transaction = await this.transactionRepo.findOne({
            where: { id }
        })
        if (!transaction) {
            throw new NotFoundException('Transaction can not be retrieved')
        }
        return transaction
    }

    async findAllTransactionsByBlockId(id: number): Promise<Transaction[]> {
        const transactions = await this.transactionRepo.find({
            where: { block: { id: id } },
            relations: ['block']
        })
        if (!transactions || transactions.length < 1) {
            throw new NotFoundException('Transaction can not be retrieved')
        }
        return transactions
    }

    async findAllTransactionsByHash(hash: string): Promise<Transaction[]> {
        const transactions = await this.transactionRepo.find({
            where: { block: { hash: hash } },
            relations: ['block']
        })
        if (!transactions || transactions.length < 1) {
            throw new NotFoundException('Transaction can not be retrieved')
        }
        return transactions
    }

    async findAllTransactions(from: string): Promise<Transaction[]> {
        const transactions = await this.transactionRepo.find({
            where: { from }
        })
        if (!transactions) {
            throw new NotFoundException('Transaction list can not be retrieved')
        }
        return transactions
    }
}