// src/flat-options/flat-options.controller.ts
import { FlatOptionsService } from './flat-options.service';
import { CreateFlatOptionsDto } from './dto/create-flat-options.dto';
import { FlatOptions } from './entities/flat-options.entity';
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

@Controller('flat-options')
export class FlatOptionsController {
  constructor(private readonly service: FlatOptionsService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateFlatOptionsDto): Promise<FlatOptions> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<FlatOptions[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<FlatOptions> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateFlatOptionsDto>,
  ): Promise<FlatOptions> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
