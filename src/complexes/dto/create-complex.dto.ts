import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateComplexDto {
  @ApiProperty({
    example: 'ЖК Солнечный',
    description: 'Название жилого комплекса',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'ул. Ленина, 5', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Центральный район', required: false })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiProperty({ example: 'СтройИнвест', required: false })
  @IsOptional()
  @IsString()
  developer?: string;

  @ApiProperty({
    example: 'Современный жилой комплекс рядом с метро',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
