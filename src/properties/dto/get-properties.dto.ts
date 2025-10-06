// src/properties/dto/get-properties.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsBoolean,
  IsEnum,
  ArrayUnique,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from '../../common/enums/property-type.enum';
import { PropertyStatus } from '../../common/enums/property-status.enum';
import { PropertyTag } from '../../common/enums/property-tag.enum';

export class GetPropertiesDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Номер страницы',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Количество элементов на странице',
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'алматы',
    description: 'Поиск по городу, району, адресу',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: PropertyType.APARTMENT,
    description: 'Фильтр по типу недвижимости',
    enum: PropertyType,
  })
  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @ApiPropertyOptional({
    example: PropertyStatus.ACTIVE,
    description: 'Фильтр по статусу',
    enum: PropertyStatus,
  })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({
    example: [PropertyTag.HOT],
    description: 'Фильтр по тегам',
    enum: PropertyTag,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(PropertyTag, { each: true })
  tags?: PropertyTag[];

  @ApiPropertyOptional({
    example: 1,
    description: 'ID города',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cityId?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'ID района',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  districtId?: number;

  @ApiPropertyOptional({
    example: 1000000,
    description: 'Минимальная цена',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    example: 50000000,
    description: 'Максимальная цена',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Минимальная площадь',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minArea?: number;

  @ApiPropertyOptional({
    example: 200,
    description: 'Максимальная площадь',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxArea?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minFloor?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxFloor?: number;

  @IsOptional()
  buildingTypeCode?: string;

  @IsOptional()
  conditionCode?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Количество комнат',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rooms?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Только опубликованные',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublished?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID агентства',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  agencyId?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID владельца',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ownerId?: number;

  @ApiPropertyOptional({
    example: 'price',
    description: 'Поле для сортировки (price, area, createdAt)',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    example: 'DESC',
    description: 'Направление сортировки',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum({ ASC: 'ASC', DESC: 'DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
