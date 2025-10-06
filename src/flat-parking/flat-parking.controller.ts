// src/flat-parking/flat-parking.controller.ts
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
import { FlatParkingService } from './flat-parking.service';
import { CreateFlatParkingDto } from './dto/create-flat-parking.dto';
import { FlatParking } from './entities/flat-parking.entity';

@Controller('flat-parking')
export class FlatParkingController {
  constructor(private readonly service: FlatParkingService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateFlatParkingDto): Promise<FlatParking> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<FlatParking[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<FlatParking> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateFlatParkingDto>,
  ): Promise<FlatParking> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
