// src/flat-balcony/dto/create-flat-balcony.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFlatBalconyDto {
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
