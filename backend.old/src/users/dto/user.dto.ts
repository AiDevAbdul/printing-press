import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsBoolean, IsArray, IsObject, IsDateString } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  full_name: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsArray()
  system_access?: string[];

  @IsOptional()
  @IsObject()
  partial_access?: Record<string, string[]>;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsArray()
  system_access?: string[];

  @IsOptional()
  @IsObject()
  partial_access?: Record<string, string[]>;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;
}

export class UpdateUserPermissionsDto {
  @IsOptional()
  @IsArray()
  system_access?: string[];

  @IsOptional()
  @IsObject()
  partial_access?: Record<string, string[]>;
}

export class SetSubstituteUserDto {
  @IsString()
  substitute_user_id: string;

  @IsDateString()
  substitute_start_date: string;

  @IsDateString()
  substitute_end_date: string;

  @IsOptional()
  @IsString()
  substitute_reason?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  department?: string;
  bio?: string;
  avatar_url?: string;
  system_access: string[];
  partial_access: Record<string, string[]>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
