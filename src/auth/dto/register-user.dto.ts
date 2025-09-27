// src/auth/dto/register-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
