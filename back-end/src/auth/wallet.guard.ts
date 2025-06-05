import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class WalletGuard implements CanActivate {
  canActivate(context: ExecutionContext,): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!body.to) {
      throw new BadRequestException("Transaction must include receiver's wallet addresses");
    }

    if (user.walletAddress !== body.from) {
      throw new UnauthorizedException('Wallet mismatch: You cannot send from another wallet');
    }
    return true;
  }
}
