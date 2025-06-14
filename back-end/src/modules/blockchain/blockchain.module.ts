import { Module } from "@nestjs/common";
import { BlockchainController } from "./blockchain.controller";
import { BlockchainService } from "./blockchain.service";
import { BlockModule } from "src/modules/block/block.module";
import { TransactionModule } from "../transaction/transaction.module";


@Module({
    imports: [TransactionModule, BlockModule],
    controllers: [BlockchainController],
    providers: [BlockchainService],
    exports: [BlockchainService],
})
export class BlockchainModule { }
