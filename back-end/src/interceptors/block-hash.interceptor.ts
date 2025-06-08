import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { createHash } from 'crypto';
import { Observable } from 'rxjs';
import { map} from 'rxjs/operators';

@Injectable()
export class BlockHashInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
        map((data)=> {
            if (data && data.transactions && data.previousHash){
                const blockData = JSON.stringify(data.transactions) + data.timestamp + data.previousHash
                const hash = createHash('sha256').update(blockData).digest('hex')
                data.hash = hash
            }
            return data;
        })
    );
  }
}
