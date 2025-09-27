// src/auth/dto/register-agency.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AgencyDto {
  @ApiProperty({ example: 'Топ Риэлт', description: 'Название агентства' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: '+7 (777) 123-45-67',
    description: 'Телефон агентства',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '123456789012', description: 'БИН агентства' })
  @IsNotEmpty()
  @IsString()
  bin: string;

  @ApiProperty({
    example: '123456789',
    description: 'КБЕ агентства',
    required: false,
  })
  @IsString()
  kbe?: string;
}

export class AdminDto {
  @ApiProperty({
    example: 'admin@topreal.kz',
    description: 'Email администратора',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Пароль администратора' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Иван', description: 'Имя администратора' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Иванов', description: 'Фамилия администратора' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    example: '+7 (701) 123-45-67',
    description: 'Телефон администратора',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;
}

export class RegisterAgencyDto {
  @ApiProperty({ description: 'Данные агентства' })
  @IsNotEmpty()
  agency: AgencyDto;

  @ApiProperty({ description: 'Данные администратора' })
  @IsNotEmpty()
  admin: AdminDto;
}
