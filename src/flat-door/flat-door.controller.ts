// src/flat-door/flat-door.controller.ts
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
import { FlatDoorService } from './flat-door.service';
import { CreateFlatDoorDto } from './dto/create-flat-door.dto';
import { FlatDoor } from './entities/flat-door.entity';

@Controller('flat-door')
export class FlatDoorController {
  constructor(private readonly service: FlatDoorService) {}

  @Post('/seed')
  @HttpCode(204)
  async seed() {
    await this.service.seed();
  }

  @Post()
  create(@Body() dto: CreateFlatDoorDto): Promise<FlatDoor> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<FlatDoor[]> {
    return this.service.findAll();
  }

  @Get(':code')
  findOne(@Param('code') code: string): Promise<FlatDoor> {
    return this.service.findOne(code);
  }

  @Put(':code')
  update(
    @Param('code') code: string,
    @Body() dto: Partial<CreateFlatDoorDto>,
  ): Promise<FlatDoor> {
    return this.service.update(code, dto);
  }

  @Delete(':code')
  delete(@Param('code') code: string): Promise<void> {
    return this.service.delete(code);
  }
}
