// src/flat-building/dto/create-flat-building.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFlatBuildingDto {
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
