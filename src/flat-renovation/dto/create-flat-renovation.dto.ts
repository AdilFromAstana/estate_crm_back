// src/flat-renovation/dto/create-flat-renovation.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFlatRenovationDto {
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
