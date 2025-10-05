import { IsOptional, IsNumberString, IsString, IsIn } from 'class-validator';

export class GetComplexesDto {
  @IsOptional() @IsNumberString() page?: number;
  @IsOptional() @IsNumberString() limit?: number;
  @IsOptional() @IsString() search?: string;

  @IsOptional() @IsNumberString() cityId?: number;
  @IsOptional() @IsNumberString() districtId?: number;
  @IsOptional() @IsString() developer?: string;

  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsIn(['ASC', 'DESC']) sortOrder?: 'ASC' | 'DESC';
}
