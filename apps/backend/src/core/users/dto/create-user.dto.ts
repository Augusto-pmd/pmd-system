import { IsEmail, IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsUUID()
  @IsOptional()
  roleId?: string;
  
  @IsUUID()
  @IsOptional()
  organizationId?: string;
}
