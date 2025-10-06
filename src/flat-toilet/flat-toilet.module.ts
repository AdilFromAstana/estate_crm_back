// src/flat-toilet/flat-toilet.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatToilet } from './entities/flat-toilet.entity';
import { FlatToiletService } from './flat-toilet.service';
import { FlatToiletController } from './flat-toilet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlatToilet])],
  providers: [FlatToiletService],
  controllers: [FlatToiletController],
  exports: [FlatToiletService],
})
export class FlatToiletModule {}
