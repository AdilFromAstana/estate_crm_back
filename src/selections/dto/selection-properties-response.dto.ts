import { ApiProperty } from '@nestjs/swagger';
import { SelectionResponseDto } from './selection-response.dto';

export class CreatedByDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'Адиль' })
  firstName: string;

  @ApiProperty({ example: 'Айжанов', required: false })
  lastName?: string;

  @ApiProperty({ example: '+77761156416', required: false })
  phone?: string;

  @ApiProperty({
    example: '/uploads/avatars/15150287-8c2c-44ac-baeb-2f92ee7da4d7.webp',
    required: false,
  })
  avatar?: string;

  @ApiProperty({ example: 'adilfirstus@gmail.com', required: false })
  email?: string;
}

export class PropertiesListDto {
  @ApiProperty({ example: [] })
  data: any[];

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: 1 })
  page?: number;

  @ApiProperty({ example: 1 })
  totalPages?: number;
}

export class SelectionWithPropertiesResponseDto {
  @ApiProperty({ type: SelectionResponseDto })
  selection: SelectionResponseDto;

  @ApiProperty({ type: PropertiesListDto })
  properties: PropertiesListDto;

  @ApiProperty({ example: 'byFilters' })
  type: string;

  @ApiProperty({ type: CreatedByDto, nullable: true })
  createdBy?: CreatedByDto;
}
