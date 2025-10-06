// src/flat-building/flat-building.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatBuilding } from './entities/flat-building.entity';
import { FlatBuildingService } from './flat-building.service';
import { FlatBuildingController } from './flat-building.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlatBuilding])],
  providers: [FlatBuildingService],
  controllers: [FlatBuildingController],
  exports: [FlatBuildingService],
})
export class FlatBuildingModule {}
