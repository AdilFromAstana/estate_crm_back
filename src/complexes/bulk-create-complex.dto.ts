import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsObject, IsString } from 'class-validator';

export class BulkComplexItemDto {
  @ApiProperty({ example: '941' })
  @IsString()
  @IsNotEmpty()
  key: number;

  @ApiProperty({ example: '12 месяцев' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ example: { parent: '105' }, required: false })
  @IsOptional()
  @IsObject()
  extra?: Record<string, any>;
}
