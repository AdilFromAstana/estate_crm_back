// src/users/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class RoleDto {
  @Expose() // ✅ Ключевой декоратор для ExcludeExtraneousValues: true
  @ApiProperty({ example: 1 })
  id: number;

  @Expose() // ✅
  @ApiProperty({ example: 'admin' })
  name: string;

  @Expose() // ✅
  @ApiProperty({ example: 'Главный администратор системы', required: false })
  description: string;
}

class AgencyDto {
  @Expose() // ✅
  @ApiProperty({ example: 1 })
  id: number;

  @Expose() // ✅
  @ApiProperty({ example: 'Топ Риэлт' })
  name: string;

  @Expose() // ✅
  @ApiProperty({ example: 'info@topreal.kz' })
  email: string;
}

export class UserResponseDto {
  @Expose() // ✅
  @ApiProperty({ example: 1 })
  id: number;

  @Expose() // ✅
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @Expose() // ✅
  @ApiProperty({ example: 'Иван' })
  firstName: string;

  @Expose() // ✅
  @ApiProperty({ example: 'Иванов' })
  lastName: string;

  @Expose() // ✅
  @ApiProperty({ example: 'Иванович', required: false })
  middleName: string;

  @Expose() // ✅
  @ApiProperty({ example: '+7 (701) 123-45-67' })
  phone: string;

  @Expose() // ✅
  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatar: string;

  // Для массивов связанных объектов нужен @Type
  @Expose() // ✅
  @Type(() => RoleDto) // 👈 Указывает мапперу тип элементов в массиве
  @ApiProperty({ type: [RoleDto] })
  roles: RoleDto[];

  @Expose() // ✅
  @Type(() => AgencyDto) // 👈 Указывает мапперу, как трансформировать объект
  @ApiProperty({ type: AgencyDto, nullable: true })
  agency: AgencyDto;

  @Expose() // ✅
  @ApiProperty({ example: 'RL-123456', required: false })
  licenseNumber: string;

  @Expose() // ✅
  @ApiProperty({ example: '2025-12-31T00:00:00.000Z', required: false })
  licenseExpiry: Date;

  @Expose() // ✅
  @ApiProperty({ example: false })
  isLicensed: boolean;

  @Expose() // ✅
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose() // ✅
  @ApiProperty({ example: false })
  isVerified: boolean;

  @Expose() // ✅
  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @Expose() // ✅
  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}
