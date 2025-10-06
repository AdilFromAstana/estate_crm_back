// src/flat-flooring/flat-flooring.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatFlooring } from './entities/flat-flooring.entity';
import { FlatFlooringService } from './flat-flooring.service';
import { FlatFlooringController } from './flat-flooring.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlatFlooring])],
  providers: [FlatFlooringService],
  controllers: [FlatFlooringController],
  exports: [FlatFlooringService],
})
export class FlatFlooringModule {}
