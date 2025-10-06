// src/flat-options/dto/create-flat-options.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFlatOptionsDto {
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
