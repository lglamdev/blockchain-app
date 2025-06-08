import { Controller, Get, Param, Request } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { Transaction } from "./entities/transaction.entity";
import { UserService } from "src/user/user.service";

@Controller('transaction')
export class TransactionController {
    constructor(
        private transactionService: TransactionService,
        private userService: UserService
    ) { }

    @Get('history')
    async getAllTransactions(@Request() req): Promise<Transaction[]> {
        return this.transactionService.findAllTransactions(req.user.walletAddess)
    }

    @Get(':id')
    async getTransactionById(@Param('id') id: number): Promise<Transaction> {
        return this.transactionService.findTransactionById(id)
    }

    @Get('block/:blockId')
    async getTransactionByBlockId(@Param('blockId') blockId: number): Promise<Transaction[]> {
        return this.transactionService.findAllTransactionsByBlockId(blockId)
    }

    @Get('block/:hash')
    async getTransactionByHash(@Param('hash') hash: string): Promise<Transaction[]> {
        return this.transactionService.findAllTransactionsByHash(hash)
    }
}