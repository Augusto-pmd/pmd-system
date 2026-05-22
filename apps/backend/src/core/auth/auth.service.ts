import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { BruteForceService } from '../../shared/services/brute-force.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly bruteForceService: BruteForceService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Para JwtStrategy: busca usuario por payload del token (no requiere password)
  async validateUserByPayload(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  // Stub: bootstrap del admin (lo hace el seed, este endpoint es no-op)
  async ensureAdminUser(): Promise<void> {
    return;
  }

  async login(user: any) {
    const payload: JwtPayload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Estructura completa que espera el frontend
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isActive: user.isActive,
        role: user.role ? {
          id: user.role.id,
          name: user.role.name,
          permissions: user.role.permissions || [],
        } : null,
        organization: user.organization ? {
          id: user.organization.id,
          name: user.organization.name,
        } : null,
        organizationId: user.organizationId,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, fullName, roleId } = registerDto;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.usersService.create({
      email,
      password,
      fullName,
      roleId,
    });

    return this.login(user);
  }

  async refreshToken(user: any) {
    const payload: JwtPayload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
