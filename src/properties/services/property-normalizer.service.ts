import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Property } from '../entities/property.entity';
import { Complex } from '../../complexes/entities/complex.entity';
import { City } from 'src/locations/entities/city.entity';
import { District } from 'src/locations/entities/district.entity';
import { FlatBuilding } from 'src/flat-building/entities/flat-building.entity';
import { FlatRenovation } from 'src/flat-renovation/entities/flat-renovation.entity';
import { FlatParking } from 'src/flat-parking/entities/flat-parking.entity';
import { FlatSecurity } from 'src/flat-security/entities/flat-security.entity';
import { LiveFurniture } from 'src/live-furniture/entities/live-furniture.entity';
import { FlatToilet } from 'src/flat-toilet/entities/flat-toilet.entity';
import { FlatBalcony } from 'src/flat-balcony/entities/flat-balcony.entity';

interface ParsedAd {
  city?: string;
  district?: string;
  complex?: string;
  buildingType?: string;
  flatRenovation?: string;
  parking?: string;
  flatSecurity?: string;
  furniture?: string;
  ceiling?: string;
  priceRaw?: string;
  rawTitle?: string;
  description?: string;
  area?: string;
  rooms?: string;
  bathroom?: string;
  balcony?: string;
  yearBuilt?: string;
  photos?: string[];
  parameters?: Record<string, string>;
  url?: string;
}

@Injectable()
export class PropertyNormalizerService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
    @InjectRepository(District)
    private readonly districtRepo: Repository<District>,
    @InjectRepository(Complex)
    private readonly complexRepo: Repository<Complex>,
    @InjectRepository(FlatBuilding)
    private readonly flatBuildingRepo: Repository<FlatBuilding>,
    @InjectRepository(FlatRenovation)
    private readonly flatRenovationRepo: Repository<FlatRenovation>,
    @InjectRepository(FlatParking)
    private readonly flatParkingRepo: Repository<FlatParking>,
    @InjectRepository(FlatSecurity)
    private readonly flatSecurityRepo: Repository<FlatSecurity>,
    @InjectRepository(LiveFurniture)
    private readonly liveFurnitureRepo: Repository<LiveFurniture>,
    @InjectRepository(FlatToilet)
    private readonly flatToiletRepo: Repository<FlatToilet>,
    @InjectRepository(FlatBalcony)
    private readonly flatBalconyRepo: Repository<FlatBalcony>,
  ) {}

  async normalize(parsed: ParsedAd): Promise<Property> {
    const city = parsed.city
      ? await this.cityRepo.findOne({
          where: { name: ILike(`%${parsed.city}%`) },
        })
      : null;

    const district = parsed.district
      ? await this.districtRepo.findOne({
          where: { name: ILike(`%${parsed.district}%`) },
        })
      : null;

    const complex = parsed.complex
      ? await this.complexRepo.findOne({
          where: { name: ILike(`%${parsed.complex}%`) },
        })
      : null;

    const flatToilet = parsed.bathroom
      ? await this.flatToiletRepo.findOne({
          where: { name: ILike(`%${parsed.bathroom}%`) },
        })
      : null;

    const flatBalcony = parsed.balcony
      ? await this.flatBalconyRepo.findOne({
          where: { name: ILike(`%${parsed.balcony}%`) },
        })
      : null;

    const buildingType = parsed.buildingType
      ? await this.flatBuildingRepo.findOne({
          where: { name: ILike(`%${parsed.buildingType}%`) },
        })
      : null;

    const liveFurniture = parsed.furniture
      ? await this.liveFurnitureRepo.findOne({
          where: { name: ILike(`%${parsed.furniture}%`) },
        })
      : null;

    const flatRenovation = parsed.flatRenovation
      ? await this.flatRenovationRepo.findOne({
          where: { name: ILike(`%${parsed.flatRenovation}%`) },
        })
      : null;

    const flatParking = parsed.parking
      ? await this.flatParkingRepo.findOne({
          where: { name: ILike(`%${parsed.parking}%`) },
        })
      : null;

    const flatSecurityCodes = await this.normalizeFlatSecurityNames(
      parsed.flatSecurity,
    );

    const { price, currency } = this.parsePrice(parsed.priceRaw);
    const { rooms, area, floor, totalFloors } = this.parseTitle(
      parsed.rawTitle,
    );

    console.log('district: ', district);

    return this.propertyRepo.create({
      title: parsed.rawTitle || '',
      description: parsed.description || '',
      city: city?.name || parsed.city || '',
      cityId: city?.id,
      district: district?.name || parsed.district || '',
      districtId: district?.id,
      complex: complex?.name || parsed.complex || '',
      complexId: complex?.id,
      buildingTypeCode: buildingType?.code || '',
      flatRenovationCode: flatRenovation?.code || '',
      flatParkingCode: flatParking?.code || '',
      flatSecurityCodes,
      liveFurnitureCode: liveFurniture?.code || '',
      flatToiletCode: flatToilet?.code || '',
      flatBalconyCode: flatBalcony?.code || '',
      ceiling: this.parseCeiling(parsed.ceiling!) ?? 0,
      area: Number(area) || 0,
      price: Number(price) || 0,
      currency: currency || '₸',
      floor: Number(floor) || 0,
      totalFloors: Number(totalFloors) || 0,
      rooms: Number(rooms) || 0,
      latitude: complex?.details?.['map.lat'] ?? 0,
      longitude: complex?.details?.['map.lon'] ?? 0,
      yearBuilt: Number(parsed.yearBuilt) || 1800,
      photos: parsed.photos || [],
      isPublished: false,
      importUrl: parsed.url,
    });
  }

  private parseCeiling(value: string): number | null {
    if (!value) return null;
    const cleaned = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  private parsePrice(priceRaw?: string): { price: string; currency: string } {
    if (!priceRaw) return { price: '0', currency: '₸' };

    const match = priceRaw.match(/^([\d\s.,]+)\s*([^\d\s]*)/);
    if (match) {
      return {
        price: match[1].replace(/\s/g, ''),
        currency: match[2] || '₸',
      };
    }
    return {
      price: priceRaw.replace(/[^\d]/g, ''),
      currency: '₸',
    };
  }

  private parseTitle(rawTitle?: string): {
    rooms: string;
    area: string;
    floor: string;
    totalFloors: string;
  } {
    let rooms = '';
    let area = '';
    let floor = '';
    let totalFloors = '';

    if (!rawTitle) return { rooms, area, floor, totalFloors };

    const roomsMatch = rawTitle.match(/^(\d+)-комнатная/);
    if (roomsMatch) rooms = roomsMatch[1];

    const areaMatch = rawTitle.match(/·\s*([\d.,]+)\s*м²/);
    if (areaMatch) area = areaMatch[1].replace(',', '.');

    const floorMatch = rawTitle.match(/·\s*(\d+)\/(\d+)\s*этаж/);
    if (floorMatch) {
      floor = floorMatch[1];
      totalFloors = floorMatch[2];
    } else {
      const floorParam = rawTitle.match(/(\d+)\s+из\s+(\d+)/);
      if (floorParam) {
        floor = floorParam[1];
        totalFloors = floorParam[2];
      }
    }

    return { rooms, area, floor, totalFloors };
  }

  private async normalizeFlatSecurityNames(
    namesStr?: string,
  ): Promise<string[]> {
    if (!namesStr?.trim()) return [];

    const names = namesStr
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (names.length === 0) return [];

    // Загружаем весь справочник один раз
    const allItems = await this.flatSecurityRepo.find();
    const nameToCode = new Map<string, string>();
    for (const item of allItems) {
      nameToCode.set(item.name.toLowerCase(), item.code);
    }

    const codes = new Set<string>();
    for (const name of names) {
      const code = nameToCode.get(name);
      if (code) codes.add(code);
    }

    return Array.from(codes);
  }
}
