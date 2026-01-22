import { IsEnum, IsOptional, IsObject } from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role.enum';

export class CreateRoleDto {
  @IsEnum(UserRole)
  name: UserRole;

  @IsObject()
  @IsOptional()
  permissions?: any;
}
