// src/live-furniture/live-furniture.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveFurniture } from './entities/live-furniture.entity';
import { LiveFurnitureService } from './live-furniture.service';
import { LiveFurnitureController } from './live-furniture.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LiveFurniture])],
  providers: [LiveFurnitureService],
  controllers: [LiveFurnitureController],
  exports: [LiveFurnitureService],
})
export class LiveFurnitureModule {}
