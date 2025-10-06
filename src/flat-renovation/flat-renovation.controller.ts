// src/flat-renovation/flat-renovation.controller.ts
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
import { FlatRenovationService } from './flat-renovation.service';
import { CreateFlatRenovationDto } from './dto/create-flat-renovation.dto';
import { FlatRenovation } from './entities/flat-renovation.entity';

@Controller('flat-renovation')
export class FlatRenovationController {
  constructor(private readonly service: FlatRenovationService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateFlatRenovationDto): Promise<FlatRenovation> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<FlatRenovation[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<FlatRenovation> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateFlatRenovationDto>,
  ): Promise<FlatRenovation> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
