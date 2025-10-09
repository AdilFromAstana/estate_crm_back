// src/properties/properties.service.ts
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';
import { Property } from '../entities/property.entity';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { GetPropertiesDto } from '../dto/get-properties.dto';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { PropertyStatus } from '../enums/property-status.enum';
import { PropertyTag } from 'src/common/enums/property-tag.enum';
import { PropertyParserService } from './property-parser.service';
import { PropertyNormalizerService } from './property-normalizer.service';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private propertiesRepository: Repository<Property>,
    private readonly parser: PropertyParserService,
    private readonly normalizer: PropertyNormalizerService,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    user: User,
  ): Promise<Property> {
    const {
      buildingTypeCode: buildingTypeArray,
      flatRenovationCode: flatRenovationArray,
      ...rest
    } = createPropertyDto;

    const buildingTypeCode = Array.isArray(buildingTypeArray)
      ? buildingTypeArray[0]
      : buildingTypeArray;

    const flatRenovationCode = Array.isArray(flatRenovationArray)
      ? flatRenovationArray[0]
      : flatRenovationArray;

    // Проверка прав доступа
    if (!this.canCreateProperty(user)) {
      throw new ForbiddenException('У вас нет прав для создания недвижимости');
    }

    // Проверка принадлежности к организации
    if (!user.agencyId) {
      throw new BadRequestException('Пользователь не привязан к организации');
    }

    const property = this.propertiesRepository.create({
      ...rest,
      buildingTypeCode, // ← одно значение
      flatRenovationCode, // ← одно значение
      ownerId: user.id,
      agencyId: user.agencyId,
      currency: createPropertyDto.currency || 'KZT',
      isPublished: true, // или true по умолчанию
    });

    return this.propertiesRepository.save(property);
  }

  async findAll(query: GetPropertiesDto, user: User | null): Promise<any> {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      tags,
      cityId,
      districtId,
      complexId,
      minPrice,
      maxPrice,
      minFloor,
      maxFloor,
      minArea,
      maxArea,
      maxCeiling,
      minCeiling,
      rooms,
      isPublished,
      agencyId,
      ownerId,
      buildingTypeCodes,
      flatRenovationCodes,
      flatBalconyCodes,
      flatParkingCodes,
      flatSecurityCodes,
      flatToiletCodes,
      liveFurnitureCodes,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.propertiesRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.owner', 'owner')
      .leftJoinAndSelect('property.agency', 'agency');

    // 🔑 Логика фильтрации по ролям
    console.log(user);
    if (!user) {
      queryBuilder.andWhere('property.isPublished = true');
      queryBuilder.andWhere(`property.status = :status`, {
        status: PropertyStatus.ACTIVE,
      });
    }

    if (isPublished !== undefined) {
      queryBuilder.andWhere('property.isPublished = :isPublished', {
        isPublished,
      });
    }

    // 🧩 Фильтры (оставляем как есть)
    if (type) {
      queryBuilder.andWhere('property.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('property.status = :status', { status });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('property.tags && :tags', { tags });
    }

    // Фильтрация по ID города и района
    if (cityId !== undefined) {
      queryBuilder.andWhere('property.cityId = :cityId', { cityId });
    }

    if (districtId !== undefined) {
      queryBuilder.andWhere('property.districtId = :districtId', {
        districtId,
      });
    }

    if (complexId !== undefined) {
      queryBuilder.andWhere('property.complexId = :complexId', {
        complexId,
      });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('property.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice });
    }

    if (minCeiling !== undefined) {
      queryBuilder.andWhere('property.price >= :minCeiling', { minCeiling });
    }

    if (maxCeiling !== undefined) {
      queryBuilder.andWhere('property.price <= :maxCeiling', { maxCeiling });
    }

    if (minArea !== undefined) {
      queryBuilder.andWhere('property.area >= :minArea', { minArea });
    }

    if (maxArea !== undefined) {
      queryBuilder.andWhere('property.area <= :maxArea', { maxArea });
    }

    if (minFloor !== undefined) {
      queryBuilder.andWhere('property.floor >= :minFloor', { minFloor });
    }
    if (maxFloor !== undefined) {
      queryBuilder.andWhere('property.floor <= :maxFloor', { maxFloor });
    }

    if (flatSecurityCodes && flatSecurityCodes.length > 0) {
      queryBuilder.andWhere(
        'property.flatSecurityCodes IN (:...flatSecurityCodes)',
        {
          flatSecurityCodes,
        },
      );
    }

    if (buildingTypeCodes && buildingTypeCodes.length > 0) {
      queryBuilder.andWhere(
        'property.buildingTypeCode IN (:...buildingTypeCode)',
        {
          buildingTypeCodes,
        },
      );
    }

    if (flatRenovationCodes && flatRenovationCodes.length > 0) {
      queryBuilder.andWhere(
        'property.flatRenovationCode IN (:...flatRenovationCode)',
        {
          flatRenovationCodes,
        },
      );
    }

    if (flatToiletCodes && flatToiletCodes.length > 0) {
      queryBuilder.andWhere('property.flatToiletCode IN (:...flatToiletCode)', {
        flatToiletCodes,
      });
    }

    if (flatParkingCodes && flatParkingCodes.length > 0) {
      queryBuilder.andWhere(
        'property.flatParkingCode IN (:...flatParkingCode)',
        {
          flatParkingCodes,
        },
      );
    }

    if (liveFurnitureCodes && liveFurnitureCodes.length > 0) {
      queryBuilder.andWhere(
        'property.liveFurnitureCode IN (:...liveFurnitureCode)',
        {
          liveFurnitureCodes,
        },
      );
    }

    if (flatBalconyCodes && flatBalconyCodes.length > 0) {
      queryBuilder.andWhere(
        'property.flatBalconyCode IN (:...flatBalconyCode)',
        {
          flatBalconyCodes,
        },
      );
    }

    if (rooms !== undefined) {
      queryBuilder.andWhere('property.rooms = :rooms', { rooms });
    }

    // 🔒 Дополнительные фильтры для авторизованных
    if (agencyId) {
      // Админ может фильтровать по любому agencyId
      // Риелтор — только по своему (но выше уже ограничено)
      queryBuilder.andWhere('property.agencyId = :agencyId', { agencyId });
    }

    if (ownerId) {
      queryBuilder.andWhere('property.ownerId = :ownerId', { ownerId });
    }

    // 📊 Сортировка
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

  async findByIds(ids: number[]) {
    if (!ids || ids.length === 0) return [];
    return this.propertiesRepository.findBy({ id: In(ids) });
  }

  async findOne(id: number, user: User | null): Promise<Property> {
    const property = await this.propertiesRepository.findOne({
      where: { id },
      relations: ['owner', 'agency'],
    });

    if (!property) {
      throw new NotFoundException('Недвижимость не найдена');
    }

    return property;
  }

  async update(
    id: number,
    updatePropertyDto: UpdatePropertyDto,
    user: User,
  ): Promise<Property> {
    const property = await this.findOne(id, user);

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
    // 1. Проверка: передан ли вообще user
    if (!user) {
      throw new ForbiddenException('Пользователь не авторизован');
    }

    // 2. Проверка: есть ли у пользователя ID
    if (!user.id) {
      throw new ForbiddenException(
        'Некорректные данные пользователя: отсутствует ID',
      );
    }

    // 3. Проверка: загружены ли роли
    if (!user.roles) {
      throw new ForbiddenException(
        `Роли пользователя не загружены. Пользователь ID: ${user.id}. Обратитесь к администратору.`,
      );
    }

    // 4. Проверка: есть ли хотя бы одна роль
    if (user.roles.length === 0) {
      throw new ForbiddenException(
        `У пользователя ID: ${user.id} нет ни одной роли. Обратитесь к администратору.`,
      );
    }

    // 5. Проверка: есть ли разрешённая роль
    const allowedRoles = [
      UserRole.AGENCY_ADMIN,
      UserRole.REALTOR,
      UserRole.MANAGER,
    ];
    const hasAllowedRole = user.roles.some((role) => {
      if (!role || !role.name) {
        console.warn(`Некорректная роль у пользователя ID: ${user.id}`, role);
        return false;
      }
      return allowedRoles.includes(role.name as UserRole);
    });

    if (!hasAllowedRole) {
      const userRoles = user.roles.map((r) => r.name).join(', ');
      throw new ForbiddenException(
        `У пользователя ID: ${user.id} недостаточно прав. ` +
          `Ваши роли: [${userRoles}]. ` +
          `Требуются роли: [${allowedRoles.join(', ')}].`,
      );
    }

    return true;
  }

  private canEditProperty(property: Property, user: User): boolean {
    if (user.roles.some((role) => role.name === UserRole.ADMIN)) return true;
    if (user.roles.some((role) => role.name === UserRole.AGENCY_ADMIN))
      return property.agencyId === user.agencyId;
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

  async parseAndCreateDraft(url: string, user: User) {
    const isAlreadyImported = await this.propertiesRepository.findOne({
      where: { importUrl: url },
    });
    if (isAlreadyImported) {
      throw new BadRequestException(
        'Этот объект с крышы уже был добавлен в систему!',
      );
    }
    const parsed = await this.parser.parse(url);
    const draft = await this.normalizer.normalize(parsed);

    draft.ownerId = user.id;
    draft.agencyId = user.agencyId;
    draft.isPublished = false; // черновик

    return this.propertiesRepository.save(draft);
  }
}
