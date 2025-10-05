// src/properties/properties.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertiesService } from './services/properties.service';
import { PropertiesController } from './properties.controller';
import { Property } from './entities/property.entity';
import { PropertyDictionariesController } from './property-dictionaries.controller';
import { City } from 'src/locations/entities/city.entity';
import { District } from 'src/locations/entities/district.entity';
import { Complex } from 'src/complexes/entities/complex.entity';
import { PropertyParserService } from './services/property-parser.service';
import { PropertyNormalizerService } from './services/property-normalizer.service';
import { PageLoaderService } from './services/page-loader.service';

@Module({
  imports: [TypeOrmModule.forFeature([Property, City, District, Complex])],
  providers: [
    PropertiesService,
    PropertyParserService,
    PropertyNormalizerService,
    PageLoaderService,
  ],
  controllers: [PropertiesController, PropertyDictionariesController],
  exports: [PropertiesService],
})
export class PropertiesModule {}
