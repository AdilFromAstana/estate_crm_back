// src/flat-phone/flat-phone.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatPhone } from './entities/flat-phone.entity';
import { FlatPhoneService } from './flat-phone.service';
import { FlatPhoneController } from './flat-phone.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlatPhone])],
  providers: [FlatPhoneService],
  controllers: [FlatPhoneController],
  exports: [FlatPhoneService],
})
export class FlatPhoneModule {}
