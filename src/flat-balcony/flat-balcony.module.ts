// src/flat-balcony/flat-balcony.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatBalcony } from './entities/flat-balcony.entity';
import { FlatBalconyService } from './flat-balcony.service';
import { FlatBalconyController } from './flat-balcony.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlatBalcony])],
  providers: [FlatBalconyService],
  controllers: [FlatBalconyController],
  exports: [FlatBalconyService],
})
export class FlatBalconyModule {}
