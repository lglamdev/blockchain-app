import { Controller, Post, UseInterceptors } from "@nestjs/common";
import { BlockHashInterceptor } from "src/interceptors/block-hash.interceptor";
import { TransactionService } from "src/transaction/transaction.service";
import { BlockService } from "./block.service";

@Controller('block')
export class BlockController {
    constructor(
        private readonly blockService: BlockService
    ) { }
}