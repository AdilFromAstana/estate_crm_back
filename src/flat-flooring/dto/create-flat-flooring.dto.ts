// src/flat-flooring/dto/create-flat-flooring.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFlatFlooringDto {
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
