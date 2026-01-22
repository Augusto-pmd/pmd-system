import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../../shared/enums/user-role.enum';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles(UserRole.ADMINISTRATION)
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Roles(UserRole.ADMINISTRATION)
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMINISTRATION)
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }
}
