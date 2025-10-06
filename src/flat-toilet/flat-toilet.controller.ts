// src/flat-toilet/flat-toilet.controller.ts
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
import { FlatToiletService } from './flat-toilet.service';
import { CreateFlatToiletDto } from './dto/create-flat-toilet.dto';
import { FlatToilet } from './entities/flat-toilet.entity';

@Controller('flat-toilet')
export class FlatToiletController {
  constructor(private readonly service: FlatToiletService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateFlatToiletDto): Promise<FlatToilet> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<FlatToilet[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<FlatToilet> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateFlatToiletDto>,
  ): Promise<FlatToilet> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
