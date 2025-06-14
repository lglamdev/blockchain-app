import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTransactionDto } from '../../transaction/dto/create-transaction.dto';

export class CreateBlockDto {
    @IsString()
    previousHash: string;

    @IsString()
    hash: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateTransactionDto)
    transactions: CreateTransactionDto[];
}
