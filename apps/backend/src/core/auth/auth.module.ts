import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../../shared/strategies/local.strategy';
import { JwtStrategy } from '../../shared/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CsrfService } from '../../shared/services/csrf.service';
import { BruteForceService } from '../../shared/services/brute-force.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, CsrfService, BruteForceService],
  exports: [AuthService],
})
export class AuthModule {}
