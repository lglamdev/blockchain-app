import { IsNotEmpty, IsNumber, IsString, IsPositive } from 'class-validator';

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    from: string;

    @IsString()
    @IsNotEmpty()
    to: string;

    @IsString()
    @IsNotEmpty()
    amount: string;
}
