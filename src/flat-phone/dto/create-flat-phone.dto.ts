// src/flat-phone/dto/create-flat-phone.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFlatPhoneDto {
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
