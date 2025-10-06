// src/inet-type/dto/create-inet-type.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateInetTypeDto {
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
