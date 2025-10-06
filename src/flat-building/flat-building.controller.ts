// src/flat-building/flat-building.controller.ts
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
import { FlatBuildingService } from './flat-building.service';
import { CreateFlatBuildingDto } from './dto/create-flat-building.dto';
import { FlatBuilding } from './entities/flat-building.entity';

@Controller('flat-building')
export class FlatBuildingController {
  constructor(private readonly service: FlatBuildingService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateFlatBuildingDto): Promise<FlatBuilding> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<FlatBuilding[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<FlatBuilding> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateFlatBuildingDto>,
  ): Promise<FlatBuilding> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
