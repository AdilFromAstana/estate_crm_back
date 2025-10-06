// src/flat-toilet/dto/create-flat-toilet.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFlatToiletDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
