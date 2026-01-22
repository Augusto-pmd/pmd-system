import { Module } from '@nestjs/common';
import { AuthModule } from '../core/auth/auth.module';
import { DebugLoginController } from './debug-login.controller';

@Module({
  imports: [AuthModule],
  controllers: [DebugLoginController],
})
export class DebugModule {}

