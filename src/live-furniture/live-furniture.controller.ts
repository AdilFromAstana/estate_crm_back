// src/live-furniture/live-furniture.controller.ts
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
import { LiveFurnitureService } from './live-furniture.service';
import { CreateLiveFurnitureDto } from './dto/create-live-furniture.dto';
import { LiveFurniture } from './entities/live-furniture.entity';

@Controller('live-furniture')
export class LiveFurnitureController {
  constructor(private readonly service: LiveFurnitureService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateLiveFurnitureDto): Promise<LiveFurniture> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<LiveFurniture[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<LiveFurniture> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateLiveFurnitureDto>,
  ): Promise<LiveFurniture> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
