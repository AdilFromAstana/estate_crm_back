// src/inet-type/inet-type.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InetType } from './entities/inet-type.entity';
import { InetTypeService } from './inet-type.service';
import { InetTypeController } from './inet-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InetType])],
  providers: [InetTypeService],
  controllers: [InetTypeController],
  exports: [InetTypeService],
})
export class InetTypeModule {}
