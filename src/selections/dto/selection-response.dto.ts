import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SelectionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Двушки до 50 млн в Астане' })
  name: string;

  @ApiPropertyOptional({ example: 'Все квартиры до 50 млн в центре' })
  description?: string;

  @ApiPropertyOptional({
    example: { rooms: 2, maxPrice: 50000000 },
    description: 'Фильтры для автоматической подборки',
  })
  filters?: Record<string, any>;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'Список ID выбранных объектов',
  })
  propertyIds?: number[];

  @ApiProperty({ example: true })
  isShared: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2025-10-11T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-11T10:30:00.000Z' })
  updatedAt: Date;
}
