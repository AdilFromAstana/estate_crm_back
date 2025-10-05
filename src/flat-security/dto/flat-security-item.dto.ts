import { ApiProperty } from '@nestjs/swagger';

export class FlatSecurityItemDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'window_grates' })
  code: string;

  @ApiProperty({ example: 'решетки на окнах' })
  name: string;
}