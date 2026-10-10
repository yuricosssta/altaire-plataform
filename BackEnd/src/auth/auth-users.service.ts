import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/user.service';

@Injectable()
export class AuthUsersService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOne(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return user;
  }

  async getUserFromToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return this.usersService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
