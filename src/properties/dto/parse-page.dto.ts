// src/properties/dto/parse-page.dto.ts
import { IsNotEmpty, IsUrl } from 'class-validator';

export class ParsePageDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
