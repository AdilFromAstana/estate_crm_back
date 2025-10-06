// src/flat-renovation/flat-renovation.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatRenovation } from './entities/flat-renovation.entity';
import { FlatRenovationService } from './flat-renovation.service';
import { FlatRenovationController } from './flat-renovation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlatRenovation])],
  providers: [FlatRenovationService],
  controllers: [FlatRenovationController],
  exports: [FlatRenovationService],
})
export class FlatRenovationModule {}
