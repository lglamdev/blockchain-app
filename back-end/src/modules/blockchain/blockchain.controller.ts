import { Controller, Get, Post, Body, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { AuthGuard } from '@nestjs/passport';
import { WalletGuard } from 'src/modules/auth/wallet.guard';
import { BlockHashInterceptor } from 'src/interceptors/block-hash.interceptor';

@Controller('blockchain')
export class BlockchainController {
    constructor(private readonly blockchainService: BlockchainService) { }

    @Get('balance')
    getBalance(@Query('address') address: string) {
        return this.blockchainService.getBalance(address);
    }
    
    @UseGuards(AuthGuard('jwt'), WalletGuard)
    @Post('send')
    @UseInterceptors(BlockHashInterceptor)
    sendTransaction(@Body() body: { to: string; amount: string },) {
        return this.blockchainService.sendTransaction(body.to, body.amount);
    }

    @Get('contract-transactions')
    getAllTransactionsByContract(@Body() body: { contractAddress: string, startBlock: 8588400, endBlock: number}){
        return this.blockchainService.getAllTransactionsByContract(body.contractAddress, body.startBlock, body.endBlock)
    }
    // @UseGuards(AuthGuard('jwt'), WalletGuard)
    // @Post('send')
    // @UseInterceptors(BlockHashInterceptor)
    // sendTransaction(@Body() body: { privateKey: string, to: string; amount: string },) {
    //     return this.blockchainService.sendTransaction(body.privateKey, body.to, body.amount);
    // }
}
