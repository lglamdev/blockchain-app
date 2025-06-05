import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TransactionLoggerMiddleware implements NestMiddleware {
    use(req: any, res: any, next: NextFunction) {
        if (req.method == "POST" && req.originalUrl.includes('/blockchain/send')) {
            console.log(`[Transaction Request] ${new Date().toISOString()}`);
            console.log(`From: ${req.body.from}`);
            console.log(`To: ${req.body.to}`);
            console.log(`Amount: ${req.body.amount}`);
        }
        next()
    }
}