// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsArray,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  agencyId: number;

  @IsNotEmpty()
  @IsArray()
  roleIds: number[];

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  licenseExpiry?: Date;

  @IsOptional()
  isLicensed?: boolean;
}
