import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMINISTRATION)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@Query() query) {
    const { page = 1, limit = 10, sortBy = 'timestamp', sortOrder = 'DESC' } = query;
    return this.auditService.findAll({ take: limit, skip: (page - 1) * limit, order: { [sortBy]: sortOrder } });
  }

  @Get('entity/:entity')
  findByEntity(@Param('entity') entity: string, @Query() query) {
    const { page = 1, limit = 10 } = query;
    return this.auditService.findByEntity(entity, { take: limit, skip: (page - 1) * limit });
  }

  @Get('entity/:entity/:entityId')
  findByEntityId(@Param('entity') entity: string, @Param('entityId') entityId: string, @Query() query) {
    const { page = 1, limit = 10 } = query;
    return this.auditService.findByEntityId(entity, entityId, { take: limit, skip: (page - 1) * limit });
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string, @Query() query) {
    const { page = 1, limit = 10 } = query;
    return this.auditService.findByUser(userId, { take: limit, skip: (page - 1) * limit });
  }
}
