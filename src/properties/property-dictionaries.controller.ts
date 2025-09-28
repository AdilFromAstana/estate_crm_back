// src/properties/property-dictionaries.controller.ts
import { Controller, Get } from '@nestjs/common';
import { BuildingType } from 'src/common/enums/building-type.enum';
import { Condition } from 'src/common/enums/condition.enum';
import { PropertyStatus } from 'src/common/enums/property-status.enum';
import { PropertyTag } from 'src/common/enums/property-tag.enum';

@Controller('properties/dictionaries')
export class PropertyDictionariesController {
  @Get('statuses')
  getStatuses() {
    return Object.values(PropertyStatus);
  }

  @Get('building-types')
  getBuildingTypes() {
    return Object.values(BuildingType);
  }

  @Get('conditions')
  getConditions() {
    return Object.values(Condition);
  }

  @Get('tags')
  getTags() {
    return Object.values(PropertyTag);
  }
}
