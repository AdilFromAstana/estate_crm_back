// src/properties/properties.service.ts
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Property } from './entities/property.entity';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { GetPropertiesDto } from './dto/get-properties.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { PropertyStatus } from '../common/enums/property-status.enum';
import { PropertyTag } from 'src/common/enums/property-tag.enum';
import * as puppeteer from 'puppeteer';
import { ParsePageDto } from './dto/parse-page.dto';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    user: User,
  ): Promise<Property> {
    // Проверка прав доступа
    if (!this.canCreateProperty(user)) {
      throw new ForbiddenException('У вас нет прав для создания недвижимости');
    }

    // Проверка принадлежности к организации
    if (!user.agency.id) {
      throw new BadRequestException('Пользователь не привязан к организации');
    }

    const property = this.propertiesRepository.create({
      ...createPropertyDto,
      ownerId: user.id,
      agencyId: user.agency.id,
      currency: createPropertyDto.currency || 'KZT',
    });

    return this.propertiesRepository.save(property);
  }

  async findAll(query: GetPropertiesDto, user: User): Promise<any> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      tags,
      city,
      district,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      rooms,
      isPublished,
      agencyId,
      ownerId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.owner', 'owner')
      .leftJoinAndSelect('property.agency', 'agency');

    // Фильтрация по правам доступа
    if (!this.canViewAllProperties(user)) {
      queryBuilder.andWhere('property.agencyId = :agencyId', {
        agencyId: user.agency.id,
      });
    }

    // Поиск по тексту
    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('property.title ILIKE :search', { search: `%${search}%` })
            .orWhere('property.description ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('property.city ILIKE :search', { search: `%${search}%` })
            .orWhere('property.district ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('property.address ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    // Фильтры
    if (type) {
      queryBuilder.andWhere('property.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('property.status = :status', { status });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('property.tags && :tags', { tags });
    }

    if (city) {
      queryBuilder.andWhere('property.city ILIKE :city', { city: `%${city}%` });
    }

    if (district) {
      queryBuilder.andWhere('property.district ILIKE :district', {
        district: `%${district}%`,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('property.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice });
    }

    if (minArea !== undefined) {
      queryBuilder.andWhere('property.area >= :minArea', { minArea });
    }

    if (maxArea !== undefined) {
      queryBuilder.andWhere('property.area <= :maxArea', { maxArea });
    }

    if (rooms !== undefined) {
      queryBuilder.andWhere('property.rooms = :rooms', { rooms });
    }

    if (isPublished !== undefined) {
      queryBuilder.andWhere('property.isPublished = :isPublished', {
        isPublished,
      });
    }

    if (agencyId) {
      queryBuilder.andWhere('property.agencyId = :agencyId', { agencyId });
    }

    if (ownerId) {
      queryBuilder.andWhere('property.ownerId = :ownerId', { ownerId });
    }

    // Сортировка
    const allowedSortFields = ['price', 'area', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`property.${sortField}`, sortOrder);

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, user: User): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['owner', 'agency'],
    });

    if (!property) {
      throw new NotFoundException('Недвижимость не найдена');
    }

    // Проверка прав доступа
    if (!this.canViewProperty(property, user)) {
      throw new ForbiddenException(
        'У вас нет прав для просмотра этой недвижимости',
      );
    }

    return property;
  }

  async update(
    id: number,
    updatePropertyDto: UpdatePropertyDto,
    user: User,
  ): Promise<Property> {
    const property = await this.findOne(id, user);

    if (!this.canEditProperty(property, user)) {
      throw new ForbiddenException(
        'У вас нет прав для редактирования этой недвижимости',
      );
    }

    Object.assign(property, updatePropertyDto);
    return this.propertiesRepository.save(property);
  }

  async remove(id: number, user: User): Promise<void> {
    const property = await this.findOne(id, user);

    // Проверка прав на удаление
    if (!this.canDeleteProperty(property, user)) {
      throw new ForbiddenException(
        'У вас нет прав для удаления этой недвижимости',
      );
    }

    await this.propertiesRepository.remove(property);
  }

  // Методы проверки прав доступа
  private canCreateProperty(user: User): boolean {
    return user.roles.some((role) =>
      [UserRole.AGENCY_ADMIN, UserRole.REALTOR, UserRole.MANAGER].includes(
        role.name as UserRole,
      ),
    );
  }

  private canViewAllProperties(user: User): boolean {
    return user.roles.some((role) =>
      [UserRole.ADMIN, UserRole.AGENCY_ADMIN].includes(role.name as UserRole),
    );
  }

  private canViewProperty(property: Property, user: User): boolean {
    if (this.canViewAllProperties(user)) return true;
    return property.agencyId === user.agency.id;
  }

  private canEditProperty(property: Property, user: User): boolean {
    if (user.roles.some((role) => role.name === UserRole.ADMIN)) return true;
    if (user.roles.some((role) => role.name === UserRole.AGENCY_ADMIN))
      return property.agencyId === user.agency.id;
    return property.ownerId === user.id;
  }

  private canDeleteProperty(property: Property, user: User): boolean {
    return this.canEditProperty(property, user);
  }

  // Специальные методы для изменения статуса
  async updateStatus(
    id: number,
    status: PropertyStatus,
    user: User,
  ): Promise<Property> {
    const property = await this.findOne(id, user);

    if (!this.canEditProperty(property, user)) {
      throw new ForbiddenException(
        'У вас нет прав для изменения статуса этой недвижимости',
      );
    }

    property.status = status;
    return this.propertiesRepository.save(property);
  }

  // Методы для работы с тегами
  async addTag(id: number, tag: PropertyTag, user: User): Promise<Property> {
    const property = await this.findOne(id, user);

    if (!this.canEditProperty(property, user)) {
      throw new ForbiddenException(
        'У вас нет прав для добавления тега этой недвижимости',
      );
    }

    if (!property.tags) {
      property.tags = [];
    }

    if (!property.tags.includes(tag)) {
      property.tags.push(tag);
      return this.propertiesRepository.save(property);
    }

    return property;
  }

  async removeTag(id: number, tag: PropertyTag, user: User): Promise<Property> {
    const property = await this.findOne(id, user);

    if (!this.canEditProperty(property, user)) {
      throw new ForbiddenException(
        'У вас нет прав для удаления тега этой недвижимости',
      );
    }

    if (property.tags && property.tags.includes(tag)) {
      property.tags = property.tags.filter((t) => t !== tag);
      return this.propertiesRepository.save(property);
    }

    return property;
  }

  async parsePage(parsePageDto: ParsePageDto): Promise<any> {
    const { url } = parsePageDto;

    if (!url.includes('krisha.kz')) {
      throw new BadRequestException('URL должен быть с сайта krisha.kz');
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();

    try {
      console.log(`Переход на страницу: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

      console.log('Страница загружена, ожидание содержимого объявления...');

      await Promise.all([
        page.waitForSelector('.layout__content .offer__container', {
          timeout: 30000,
        }),
        page.waitForSelector('.layout__content .offer__advert-title', {
          timeout: 30000,
        }),
      ]);
      console.log('Контейнер объявления и заголовок найдены.');

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const data = await page.evaluate(() => {
        // --- НОВАЯ ФУНКЦИЯ: Извлечение координат внутри page.evaluate ---
        // Эта функция теперь находится внутри page.evaluate и имеет доступ к window.*

        const safeTextContent = (
          selector: string,
          root: Element | Document = document,
        ): string => {
          const element = root.querySelector(selector);
          return element ? element.textContent?.trim() || '' : '';
        };

        // --- Основные данные ---
        const rawTitle = safeTextContent('.offer__advert-title h1');
        const priceRaw = safeTextContent('.offer__price');
        const addressRaw = safeTextContent('.offer__location');
        const cityAndDistrictRaw =
          addressRaw.split('\n')[0]?.trim() || addressRaw;
        const cityAndDistrictParts = cityAndDistrictRaw
          .split(',')
          .map((part) => part.trim())
          .filter((part) => part.length > 0);
        const cityFromLocation = cityAndDistrictParts[0] || '';
        const districtFromLocation = cityAndDistrictParts[1] || '';

        // --- Извлечение и обработка заголовка ---
        let title = rawTitle;
        let roomsFromTitle = '';
        let floorFromTitle = '';
        let totalFloorsFromTitle = '';
        let areaFromTitle = '';

        if (rawTitle) {
          const roomsMatch = rawTitle.match(/^(\d+)-комнатная/);
          if (roomsMatch) {
            roomsFromTitle = roomsMatch[1];
          }

          const areaMatch = rawTitle.match(/·\s*([\d.,]+)\s*м²/);
          if (areaMatch) {
            areaFromTitle = areaMatch[1].replace(',', '.');
          }

          const floorMatch = rawTitle.match(/·\s*(\d+)\/(\d+)\s*этаж/);
          if (floorMatch) {
            floorFromTitle = floorMatch[1];
            totalFloorsFromTitle = floorMatch[2];
          }
        }

        // --- Парсинг адреса из заголовка (улица и номер дома) ---
        let street = '';
        let houseNumber = '';

        if (rawTitle) {
          const addressPartMatch = rawTitle.match(/·\s*([^·]+)$/);
          if (addressPartMatch) {
            let addressPart = addressPartMatch[1].trim();
            addressPart = addressPart.replace(/\s*за\s*~.*$/, '').trim();
            addressPart = addressPart
              .replace(/[\d.,]+\s*м²\s*,?\s*/i, '')
              .trim();

            const addressParts = addressPart
              .split(',')
              .map((part) => part.trim())
              .filter((part) => part.length > 0);

            if (addressParts.length > 0) {
              const lastPart = addressParts[addressParts.length - 1];

              const houseNumberMatch = lastPart.match(/^(.*?)\s+([\d\/\-]+)$/);
              if (houseNumberMatch) {
                street = houseNumberMatch[1].trim();
                houseNumber = houseNumberMatch[2].trim();
              } else {
                const isAllNumber = /^[\d\/\-]+$/.test(lastPart);
                if (isAllNumber) {
                  houseNumber = lastPart;
                  if (addressParts.length > 1) {
                    street = addressParts
                      .slice(0, addressParts.length - 1)
                      .join(', ');
                  }
                } else {
                  street = lastPart;
                }
              }

              if (!street && addressParts.length > 1) {
                street = addressParts
                  .slice(0, addressParts.length - 1)
                  .join(', ');
              } else if (!street && addressParts.length === 1 && !houseNumber) {
                street = addressParts[0];
              }

              if (street) {
                street = street
                  .replace(
                    /^(ул\.?|улица|проспект|просп\.?|пр-т|пр-кт|пер\.?|переулок|бульвар|бул\.?|шоссе|ш\.?|аллея|ал\.?|микрорайон|мкрн?\.?|жилой комплекс|жк)/i,
                    '',
                  )
                  .trim();
              }
            }
          }
        }

        // --- Параметры квартиры ---
        const parameters: Record<string, string> = {};

        // 1. Извлекаем параметры из .offer__short-description
        const shortParamElements = document.querySelectorAll(
          '.offer__short-description .offer__info-item',
        );
        shortParamElements.forEach((item) => {
          const dt = item.querySelector('.offer__info-title');
          const dd = item.querySelector('.offer__advert-short-info');
          if (dt && dd) {
            const key = dt.textContent?.trim() || '';
            const ddContent = dd.textContent?.trim() || '';
            const ddLink = dd.querySelector('a');
            const value = ddLink
              ? ddLink.textContent?.trim() || ddContent
              : ddContent;

            const dataName = item.getAttribute('data-name') || key;
            parameters[dataName] = value;
          }
        });

        // 2. Извлекаем дополнительные параметры из .offer__parameters
        const detailedParamElements = document.querySelectorAll(
          '.offer__parameters dl',
        );
        detailedParamElements.forEach((dl) => {
          const dt = dl.querySelector('dt');
          const dd = dl.querySelector('dd');
          if (dt && dd) {
            const key = dt.textContent?.trim() || '';
            const dataName = dt.getAttribute('data-name') || key;
            const value = dd.textContent?.trim() || '';
            parameters[dataName] = value;
          }
        });

        // --- Обработка параметров ---
        const buildingType = parameters['flat.building'] || '';
        const complex = parameters['map.complex'] || '';
        const yearBuilt = parameters['house.year'] || '';

        const areaFull = parameters['live.square'] || '';
        let area = '';
        let kitchenArea = '';
        if (areaFull) {
          const areaMatch = areaFull.match(/^([\d.,\s]+)/);
          if (areaMatch) {
            area = areaMatch[1].replace(/[^\d.,]/g, '').replace(',', '.');
          }
          const kitchenMatch = areaFull.match(
            /Площадь кухни\s*—\s*([\d.,\s]+)\s*м²/,
          );
          if (kitchenMatch) {
            kitchenArea = kitchenMatch[1]
              .replace(/[^\d.,]/g, '')
              .replace(',', '.');
          }
        }
        if (!area && areaFromTitle) {
          area = areaFromTitle;
        }

        const roomsParam = (
          parameters['live.rooms'] ||
          parameters['Количество комнат'] ||
          ''
        ).replace(/\D/g, '');
        const rooms = roomsFromTitle || roomsParam;

        let floorInfo = '';
        let floor = '';
        let totalFloors = '';
        if (floorFromTitle && totalFloorsFromTitle) {
          floorInfo = `${floorFromTitle} из ${totalFloorsFromTitle}`;
          floor = floorFromTitle;
          totalFloors = totalFloorsFromTitle;
        } else {
          floorInfo = parameters['flat.floor'] || '';
          const floorParamMatch = floorInfo.match(/^(\d+)\s+из\s+(\d+)$/);
          if (floorParamMatch) {
            floor = floorParamMatch[1];
            totalFloors = floorParamMatch[2];
          }
        }

        const condition = parameters['flat.renovation'] || '';
        const bathroom = parameters['flat.toilet'] || '';
        const balcony = parameters['flat.balcony'] || '';
        const parking = parameters['flat.parking'] || '';
        const furniture = parameters['live.furniture'] || '';

        // --- Описание ---
        const description =
          safeTextContent('.offer__description .text') ||
          safeTextContent('.a-description__text');

        // --- Изображения ---
        const imageUrls: string[] = [];
        const galleryItems = document.querySelectorAll('.gallery__small-item');
        galleryItems.forEach((item) => {
          let imgUrl = item.getAttribute('data-photo-url');
          if (!imgUrl) {
            const sourceWebp = item.querySelector('source[type="image/webp"]');
            if (sourceWebp) {
              const srcset = sourceWebp.getAttribute('srcset') || '';
              imgUrl = srcset.split(' ')[0];
            }
            if (!imgUrl) {
              const img = item.querySelector('img');
              imgUrl = (img as HTMLImageElement)?.src || '';
            }
          }
          if (imgUrl && !imageUrls.includes(imgUrl)) {
            imageUrls.push(imgUrl);
          }
        });

        if (imageUrls.length === 0) {
          const mainPhotoImg = document.querySelector('.gallery__main img');
          const mainPhotoUrl = (mainPhotoImg as HTMLImageElement)?.src;
          if (mainPhotoUrl) {
            imageUrls.push(mainPhotoUrl);
          }
        }

        // --- Цена ---
        let price = '';
        let currency = '';
        if (priceRaw) {
          const match = priceRaw.match(/^([\d\s.,]+)\s*([^\d\s]*)/);
          if (match) {
            price = match[1].replace(/\s/g, '');
            currency = match[2] || '₸';
          } else {
            price = priceRaw.replace(/[^\d]/g, '');
          }
        }

        return {
          title,
          price,
          currency,
          address: addressRaw,
          city: cityFromLocation,
          district: districtFromLocation,
          street,
          houseNumber,
          area,
          kitchenArea,
          rooms,
          floorInfo,
          floor,
          totalFloors,
          buildingType,
          yearBuilt,
          condition,
          bathroom,
          balcony,
          parking,
          furniture,
          complex,
          description,
          images: imageUrls,
          sourceUrl: window.location.href,
        };
      });

      await browser.close();
      console.log('Парсинг завершен успешно.');
      return data;
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      console.error('Ошибка при парсинге страницы:', error);
      if (error.name === 'TimeoutError') {
        throw new BadRequestException(`Таймаут при загрузке страницы: ${url}`);
      }
      throw new BadRequestException(
        `Ошибка при парсинге страницы: ${error.message}`,
      );
    }
  }
}
