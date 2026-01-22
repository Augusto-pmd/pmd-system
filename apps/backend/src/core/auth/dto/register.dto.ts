import { IsEmail, IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class RegisterDto {
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
}
