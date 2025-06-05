import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { AuthGuard } from '@nestjs/passport';
import { WalletGuard } from 'src/auth/wallet.guard';

@Controller('blockchain')
export class BlockchainController {
    constructor(private readonly blockchainService: BlockchainService) { }

    @Get('balance')
    getBalance(@Query('address') address: string) {
        return this.blockchainService.getBalance(address);
    }
    
    @UseGuards(AuthGuard('jwt'), WalletGuard)
    @Post('send')
    sendTransaction(@Body() body: { to: string; amount: string },) {
        return this.blockchainService.sendTransaction(body.to, body.amount);
    }
}
