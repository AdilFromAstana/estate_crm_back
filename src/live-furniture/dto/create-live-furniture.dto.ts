// src/live-furniture/dto/create-live-furniture.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateLiveFurnitureDto {
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
