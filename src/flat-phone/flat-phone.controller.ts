// src/flat-phone/flat-phone.controller.ts
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
import { FlatPhoneService } from './flat-phone.service';
import { CreateFlatPhoneDto } from './dto/create-flat-phone.dto';
import { FlatPhone } from './entities/flat-phone.entity';

@Controller('flat-phone')
export class FlatPhoneController {
  constructor(private readonly service: FlatPhoneService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateFlatPhoneDto): Promise<FlatPhone> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<FlatPhone[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<FlatPhone> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateFlatPhoneDto>,
  ): Promise<FlatPhone> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
