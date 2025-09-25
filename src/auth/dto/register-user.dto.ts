// src/auth/dto/register-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class RegisterUserDto {
  @ApiProperty({
    example: 'realtor@agency.kz',
    description: 'Email пользователя',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'Пароль (минимум 8 символов)',
  })
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 1,
    description: 'ID агентства',
  })
  @IsNotEmpty()
  @IsNumber()
  agencyId: number;

  @ApiProperty({
    example: [UserRole.REALTOR],
    description: 'Роли пользователя (минимум одна)',
    enum: UserRole,
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  roles: UserRole[];
}
