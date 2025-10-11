import { ApiProperty } from '@nestjs/swagger';

export class PropertyOwnerDto {
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
}

export class PropertyAgencyDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'JUZ Real Estate' })
  name: string;

  @ApiProperty({ example: '+7 707 845 8177', required: false })
  phone?: string;
}

export class PropertyResponseDto {
  @ApiProperty({ example: 27 })
  id: number;

  @ApiProperty({
    example: '2-комнатная квартира · 47 м² · 4/9 этаж, E15 13',
  })
  title: string;

  @ApiProperty({ example: 'Квартира с отличным ремонтом', required: false })
  description?: string;

  @ApiProperty({ example: 'apartment' })
  type: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: 'Астана' })
  city: string;

  @ApiProperty({ example: 'Нура р-н' })
  district: string;

  @ApiProperty({ example: 'BAIMURA 2', required: false })
  complex?: string;

  @ApiProperty({ example: 47 })
  area: number;

  @ApiProperty({ example: 2 })
  rooms: number;

  @ApiProperty({ example: 34999000 })
  price: number;

  @ApiProperty({ example: '〒' })
  currency: string;

  @ApiProperty({
    example: [
      'https://krisha-photos.kcdn.online/.../1-750x470.jpg',
      'https://krisha-photos.kcdn.online/.../2-750x470.jpg',
    ],
  })
  photos: string[];

  @ApiProperty({ type: PropertyOwnerDto, required: false })
  owner?: PropertyOwnerDto;

  @ApiProperty({ type: PropertyAgencyDto, required: false })
  agency?: PropertyAgencyDto;

  @ApiProperty({ example: '2025-10-09T05:24:22.957Z' })
  createdAt: string;
}
