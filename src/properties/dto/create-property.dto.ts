// src/properties/dto/create-property.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsInt,
  Min,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
  IsUrl,
  ArrayUnique,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType } from '../../common/enums/property-type.enum';
import { PropertyStatus } from '../../common/enums/property-status.enum';
import { PropertyTag } from '../../common/enums/property-tag.enum';
import { Amenity } from '../../common/enums/amenity.enum';
import { BuildingType } from 'src/common/enums/building-type.enum';
import { Condition } from 'src/common/enums/condition.enum';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Квартира в центре Алматы',
    description: 'Название объявления',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Прекрасная квартира в центре города...',
    description: 'Описание недвижимости',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: PropertyType.APARTMENT,
    enum: PropertyType,
    description: 'Тип недвижимости',
  })
  @IsNotEmpty()
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({
    example: PropertyStatus.ACTIVE,
    enum: PropertyStatus,
    description: 'Статус недвижимости',
  })
  @IsNotEmpty()
  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  @ApiPropertyOptional({
    example: [PropertyTag.HOT, PropertyTag.TOP],
    enum: PropertyTag,
    isArray: true,
    description: 'Теги недвижимости',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(PropertyTag, { each: true })
  tags?: PropertyTag[];

  // Географические данные
  @ApiProperty({ example: 'Алматы', description: 'Город' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 1, description: 'ID города' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  cityId: number;

  @ApiProperty({ example: 'Медеуский', description: 'Район' })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({ example: 1, description: 'ID района' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  districtId: number;

  @ApiProperty({ example: 'проспект Абая 123', description: 'Адрес' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiPropertyOptional({ example: 43.2389, description: 'Широта' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 76.8877, description: 'Долгота' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 120.5, description: 'Площадь в кв. метрах' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  area: number;

  @ApiProperty({ example: 2, description: 'Количество комнат' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  rooms: number;

  @ApiProperty({ example: 5, description: 'Этаж' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  floor: number;

  @ApiProperty({ example: 9, description: 'Этажность здания' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  totalFloors: number;

  @ApiPropertyOptional({ example: 2020, description: 'Год постройки' })
  @IsOptional()
  @IsInt()
  @Min(1800)
  yearBuilt?: number;

  @ApiPropertyOptional({ example: 2020, description: 'BuildingType' })
  @IsOptional()
  @IsEnum(BuildingType, { each: true })
  buildingType?: BuildingType[];

  @ApiPropertyOptional({ example: 2020, description: 'Condition' })
  @IsOptional()
  @IsEnum(Condition, { each: true })
  condition?: Condition[];

  // Финансовые данные
  @ApiProperty({ example: 25000000, description: 'Цена в тенге' })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 'KZT',
    description: 'Валюта',
    default: 'KZT',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  // Удобства
  @ApiPropertyOptional({
    example: [Amenity.INTERNET, Amenity.REFRIGERATOR, Amenity.FLOOR_HEATING],
    enum: Amenity,
    isArray: true,
    description: 'Удобства',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(Amenity, { each: true })
  amenities?: Amenity[];

  // Дополнительные данные
  @ApiPropertyOptional({ example: true, description: 'Наличие балкона' })
  @IsOptional()
  @IsBoolean()
  hasBalcony?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Наличие парковки' })
  @IsOptional()
  @IsBoolean()
  hasParking?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Наличие лифта' })
  @IsOptional()
  @IsBoolean()
  hasElevator?: boolean;

  @ApiPropertyOptional({
    example: 'https://example.com/photo1.jpg',
    description: 'URL главного фото',
  })
  @IsOptional()
  @IsUrl()
  mainPhoto?: string;

  @ApiPropertyOptional({
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
    description: 'URL дополнительных фото',
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  photos?: string[];

  @ApiPropertyOptional({ example: true, description: 'Опубликовано' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({
    example: 'krisha.kz',
    description: 'Сайт парсинга из krisha.kz',
  })
  @IsOptional()
  @IsUrl()
  importUrl: string;
}
