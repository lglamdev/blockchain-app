import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginUserDto } from '../user/dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateAndLogin(loginDto: LoginUserDto): Promise<{ token: string }> {
    const user = await this.userService.validateUser(loginDto);

    const payload = { sub: user.id, username: user.username, walletAddress: user.walletAddress };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async verifyToken(token: string) {
    return this.jwtService.verify(token);
  }
}
