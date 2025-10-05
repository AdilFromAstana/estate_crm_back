// dto/bulk-create-complex.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class BulkComplexItemDto {
  @ApiProperty({ example: '941' })
  @IsNotEmpty()
  @IsString() // потому что в JSON id — строка
  key: string; // это будет id

  @ApiProperty({ example: '12 месяцев' })
  @IsNotEmpty()
  @IsString()
  value: string; // это будет name

  @ApiProperty({
    example: {
      'map.lat': 51.1414,
      'map.lon': 71.4765,
      'house.year': 2018,
    },
    required: false,
  })
  @IsOptional()
  extra?: Record<string, any>; // ← именно так вы передаёте details
}
