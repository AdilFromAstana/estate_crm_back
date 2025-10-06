// src/flat-parking/dto/create-flat-parking.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFlatParkingDto {
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
