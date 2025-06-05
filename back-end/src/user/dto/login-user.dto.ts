import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
    @IsString()
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username must only contain letters, numbers, and underscores',
    })
    username: string;

    @IsString()
    @MinLength(6)
    @MaxLength(32)
    @Matches(/^[^<>{}"'$;`%]+$/, {
        message: 'Password contains potentially unsafe characters',
    })
    password: string;
}
