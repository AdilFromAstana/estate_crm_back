// src/flat-security/dto/create-flat-security.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFlatSecurityDto {
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
