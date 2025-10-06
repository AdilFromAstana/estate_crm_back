// src/flat-flooring/flat-flooring.controller.ts
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
import { FlatFlooringService } from './flat-flooring.service';
import { CreateFlatFlooringDto } from './dto/create-flat-flooring.dto';
import { FlatFlooring } from './entities/flat-flooring.entity';

@Controller('flat-flooring')
export class FlatFlooringController {
  constructor(private readonly service: FlatFlooringService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateFlatFlooringDto): Promise<FlatFlooring> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<FlatFlooring[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<FlatFlooring> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateFlatFlooringDto>,
  ): Promise<FlatFlooring> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
