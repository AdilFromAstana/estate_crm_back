// src/flat-security/flat-security.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { FlatSecurityService } from './flat-security.service';
import { CreateFlatSecurityDto } from './dto/create-flat-security.dto';
import { FlatSecurity } from './entities/flat-security.entity';

@Controller('flat-security')
export class FlatSecurityController {
  constructor(private readonly service: FlatSecurityService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateFlatSecurityDto): Promise<FlatSecurity> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<FlatSecurity[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<FlatSecurity> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateFlatSecurityDto>,
  ): Promise<FlatSecurity> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
