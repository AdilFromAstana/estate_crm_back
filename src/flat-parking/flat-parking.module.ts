// src/flat-parking/flat-parking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatParking } from './entities/flat-parking.entity';
import { FlatParkingService } from './flat-parking.service';
import { FlatParkingController } from './flat-parking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlatParking])],
  providers: [FlatParkingService],
  controllers: [FlatParkingController],
  exports: [FlatParkingService],
})
export class FlatParkingModule {}
