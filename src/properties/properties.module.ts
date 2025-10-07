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
import { FlatBuilding } from 'src/flat-building/entities/flat-building.entity';
import { FlatRenovation } from 'src/flat-renovation/entities/flat-renovation.entity';
import { FlatParking } from 'src/flat-parking/entities/flat-parking.entity';
import { FlatSecurity } from 'src/flat-security/entities/flat-security.entity';
import { LiveFurniture } from 'src/live-furniture/entities/live-furniture.entity';
import { FlatToilet } from 'src/flat-toilet/entities/flat-toilet.entity';
import { FlatBalcony } from 'src/flat-balcony/entities/flat-balcony.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Property,
      City,
      District,
      Complex,
      FlatBuilding,
      FlatRenovation,
      FlatParking,
      FlatSecurity,
      LiveFurniture,
      FlatToilet,
      FlatBalcony
    ]),
  ],
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
