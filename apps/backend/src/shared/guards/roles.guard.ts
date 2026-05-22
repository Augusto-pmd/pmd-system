import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger('RolesGuard');

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si el endpoint no declara @Roles, dejamos pasar
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // Log de diagnóstico (sólo en development)
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(
        `Verificando acceso. Required: [${requiredRoles.join(', ')}]. User: ${
          user ? JSON.stringify({
            id: user.id,
            email: user.email,
            roleName: user.role?.name,
            roleType: typeof user.role,
          }) : 'NULL'
        }`,
      );
    }

    if (!user) {
      this.logger.warn('user is null in request - JwtStrategy no inyectó user');
      return false;
    }

    if (!user.role || !user.role.name) {
      this.logger.warn(
        `user.role no está cargado. Email: ${user.email}. Role: ${JSON.stringify(user.role)}`,
      );
      return false;
    }

    // Comparación case-insensitive por las dudas
    const userRoleName = String(user.role.name).toLowerCase();

    // BYPASS: Direction es super-admin y tiene acceso a TODO (override por jerarquía)
    if (userRoleName === 'direction') {
      return true;
    }

    const allowed = requiredRoles.some(
      (role) => String(role).toLowerCase() === userRoleName,
    );

    if (!allowed && process.env.NODE_ENV === 'development') {
      this.logger.warn(
        `Acceso DENEGADO. Rol del usuario "${userRoleName}" no está en requeridos: [${requiredRoles.join(', ')}]`,
      );
    }

    return allowed;
  }
}
