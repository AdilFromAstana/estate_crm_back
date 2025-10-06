// src/flat-options/flat-options.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatOptions } from './entities/flat-options.entity';
import { FlatOptionsService } from './flat-options.service';
import { FlatOptionsController } from './flat-options.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlatOptions])],
  providers: [FlatOptionsService],
  controllers: [FlatOptionsController],
  exports: [FlatOptionsService],
})
export class FlatOptionsModule {}
