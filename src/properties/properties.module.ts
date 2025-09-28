// src/properties/properties.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './entities/property.entity';
import { PropertyDictionariesController } from './property-dictionaries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Property])],
  providers: [PropertiesService],
  controllers: [PropertiesController, PropertyDictionariesController],
  exports: [PropertiesService],
})
export class PropertiesModule {}
