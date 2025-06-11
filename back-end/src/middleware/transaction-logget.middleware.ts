import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TransactionLoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (req.method == "POST" && req.originalUrl.includes('/blockchain/send')) {
            const authHeader = req.headers.authorization;

            let address = 'Unknown';

            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];

                try {
                    const decoded: any = jwt.decode(token);
                    address = decoded.walletAddress;
                } catch (error) {
                    console.warn('JWT decode error:', error);
                }
            }
            console.log(`[Transaction Request] ${new Date().toISOString()}`);
            console.log(`From: ${address}`);
            console.log(`To: ${req.body.to}`);
            console.log(`Amount: ${req.body.amount}`);
            console.log("-------------------------------------------------------");
        }
        next()
    }
}