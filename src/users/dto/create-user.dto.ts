// src/users/dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  agencyId: number;

  @IsNotEmpty()
  @IsArray()
  roleIds: number[];
}
