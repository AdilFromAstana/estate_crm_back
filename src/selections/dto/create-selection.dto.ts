// src/selections/dto/create-selection.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsBoolean,
  IsOptional,
  ArrayUnique,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSelectionDto {
  @ApiProperty({
    example: 'Трешки в Медеуском',
    description: 'Название подборки',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Все трешки в Медеуском районе',
    description: 'Описание подборки',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: { rooms: 3, maxPrice: 50000000 },
    description: 'Параметры фильтрации',
  })
  @IsOptional()
  @IsObject()
  filters?: any;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'ID конкретных объектов недвижимости',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  propertyIds?: number[];

  @ApiPropertyOptional({
    example: false,
    description: 'Общедоступная подборка',
  })
  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}
