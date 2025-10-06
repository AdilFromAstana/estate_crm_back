// src/flat-door/dto/create-flat-door.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFlatDoorDto {
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
