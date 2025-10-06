// src/flat-door/flat-door.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatDoor } from './entities/flat-door.entity';
import { FlatDoorService } from './flat-door.service';
import { FlatDoorController } from './flat-door.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlatDoor])],
  providers: [FlatDoorService],
  controllers: [FlatDoorController],
  exports: [FlatDoorService],
})
export class FlatDoorModule {}
