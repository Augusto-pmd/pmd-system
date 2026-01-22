import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminResetController } from './admin-reset.controller';
import { User } from ../core/users/user.entity';
import { Role } from './core/roles/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  controllers: [AdminResetController],
})
export class AdminResetModule {}
