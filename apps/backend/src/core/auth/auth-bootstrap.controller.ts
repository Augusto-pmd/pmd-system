import { Controller, Post, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';

@Controller('auth-bootstrap')
export class AuthBootstrapController {
  constructor(private readonly authService: AuthService) {}

  @Post('ensure-admin')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMINISTRATION) // Proteger esta ruta
  async ensureAdmin() {
    await this.authService.ensureAdminUser();
    return { message: 'Admin user provisioned if not exists.' };
  }
}
