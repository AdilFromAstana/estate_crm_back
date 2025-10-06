// src/flat-balcony/flat-balcony.controller.ts
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
import { FlatBalconyService } from './flat-balcony.service';
import { CreateFlatBalconyDto } from './dto/create-flat-balcony.dto';
import { FlatBalcony } from './entities/flat-balcony.entity';

@Controller('flat-balcony')
export class FlatBalconyController {
  constructor(private readonly service: FlatBalconyService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateFlatBalconyDto): Promise<FlatBalcony> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<FlatBalcony[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<FlatBalcony> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateFlatBalconyDto>,
  ): Promise<FlatBalcony> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
