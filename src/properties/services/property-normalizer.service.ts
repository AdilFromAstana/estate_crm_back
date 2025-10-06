import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Property } from '../entities/property.entity';
import { Complex } from '../../complexes/entities/complex.entity';
import { City } from 'src/locations/entities/city.entity';
import { District } from 'src/locations/entities/district.entity';

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
  ) {}

  async normalize(parsed: any): Promise<Property> {
    const city = await this.cityRepo.findOne({
      where: { name: ILike(`%${parsed.city}%`) },
    });

    const district = city
      ? await this.districtRepo.findOne({
          where: { name: ILike(`%${parsed.district}%`), cityId: city.id },
        })
      : null;

    const complex = parsed.complex
      ? await this.complexRepo.findOne({
          where: { name: ILike(`%${parsed.complex}%`) },
        })
      : null;

    const flat_phone = [
      { id: '1', name: 'отдельный' },
      { id: '2', name: 'блокиратор' },
      { id: '3', name: 'есть возможность подключения' },
      { id: '4', name: 'нет' },
    ];
    const inet_type = [
      { id: '1', name: 'ADSL' },
      { id: '2', name: 'через TV кабель' },
      { id: '3', name: 'проводной' },
      { id: '4', name: 'оптика' },
    ];
    const flat_toilet = [
      { id: '1', name: 'раздельный' },
      { id: '2', name: 'совмещенный' },
      { id: '3', name: '2 с/у и более' },
      { id: '4', name: 'нет' },
    ];
    const flat_balcony = [
      { id: '1', name: 'балкон' },
      { id: '2', name: 'лоджия' },
      { id: '3', name: 'балкон и лоджия' },
      { id: '4', name: 'несколько балконов или лоджий' },
    ];
    const flat_balcony_g = [
      { id: '0', name: 'нет' },
      { id: '1', name: 'да' },
    ];
    const flat_door = [
      { id: '1', name: 'деревянная' },
      { id: '2', name: 'металлическая' },
      { id: '3', name: 'бронированная' },
    ];
    const flat_parking = [
      { id: '1', name: 'паркинг' },
      { id: '2', name: 'гараж' },
      { id: '3', name: 'рядом охраняемая стоянка' },
    ];
    const live_furniture = [
      { id: '1', name: 'полностью' },
      { id: '2', name: 'частично' },
      { id: '3', name: 'без мебели' },
    ];
    const flat_flooring = [
      { id: '1', name: 'линолеум' },
      { id: '2', name: 'паркет' },
      { id: '3', name: 'ламинат' },
      { id: '4', name: 'дерево' },
      { id: '5', name: 'ковролан' },
      { id: '6', name: 'плитка' },
      { id: '7', name: 'пробковый' },
    ];
    const flat_options = [
      { id: '1', name: 'пластиковые окна' },
      { id: '2', name: 'неугловая' },
      { id: '3', name: 'улучшенная' },
      { id: '4', name: 'комнаты изолированы' },
      { id: '5', name: 'кухня-студия' },
      { id: '6', name: 'встроенная кухня' },
      { id: '7', name: 'новая сантехника' },
      { id: '8', name: 'кладовка' },
      { id: '9', name: 'счётчики' },
      { id: '10', name: 'тихий двор' },
      { id: '11', name: 'кондиционер' },
      { id: '12', name: 'удобно под коммерцию' },
    ];

    const draft = this.propertyRepo.create({
      title: parsed.title || '',
      description: parsed.description || '',
      city: city?.name || parsed.city || '',
      cityId: city?.id,
      district: district?.name || parsed.district || '',
      districtId: district?.id,
      complex: complex?.name || parsed.complex || '',
      complexId: complex?.id,
      buildingType: parsed.buildingType || '',
      area: Number(parsed.area) || 0,
      price: Number(parsed.price) || 0,
      floor: Number(parsed.floor) || 0,
      totalFloors: Number(parsed.totalFloors) || 0,
      rooms: Number(parsed.rooms) || 0,
      yearBuilt: Number(parsed.yearBuilt) || 1800,
      photos: parsed.photos || [],
      isPublished: false, // черновик
    });

    return draft;
  }
}
