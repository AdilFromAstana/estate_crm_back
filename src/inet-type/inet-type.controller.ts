// src/inet-type/inet-type.controller.ts
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
import { InetTypeService } from './inet-type.service';
import { CreateInetTypeDto } from './dto/create-inet-type.dto';
import { InetType } from './entities/inet-type.entity';

@Controller('inet-type')
export class InetTypeController {
  constructor(private readonly service: InetTypeService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateInetTypeDto): Promise<InetType> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<InetType[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<InetType> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateInetTypeDto>,
  ): Promise<InetType> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
