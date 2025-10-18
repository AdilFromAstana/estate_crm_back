// src/selections/selections.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Selection } from './entities/selection.entity';
import { CreateSelectionDto } from './dto/create-selection.dto';
import { UpdateSelectionDto } from './dto/update-selection.dto';
import { User } from '../users/entities/user.entity';
import { PropertiesService } from 'src/properties/services/properties.service';
import { SelectionWithPropertiesResponseDto } from './dto/selection-properties-response.dto';

@Injectable()
export class SelectionsService {
  constructor(
    @InjectRepository(Selection)
    private selectionsRepository: Repository<Selection>,
    private readonly propertiesService: PropertiesService,
  ) { }

  async create(
    createSelectionDto: CreateSelectionDto,
    user: User,
  ): Promise<Selection> {
    // Проверяем, что передан хотя бы один из вариантов
    if (!createSelectionDto.filters && !createSelectionDto.propertyIds) {
      throw new BadRequestException(
        'Необходимо указать фильтры или конкретные объекты недвижимости',
      );
    }

    // Проверяем количество существующих подборок пользователя
    const userSelectionsCount = await this.selectionsRepository.count({
      where: { userId: user.id },
    });

    if (userSelectionsCount >= 50) {
      // Лимит 50 подборок на пользователя
      throw new BadRequestException('Достигнут лимит подборок (50)');
    }

    // Создаем объект с правильными типами
    const selectionData = {
      ...createSelectionDto,
      userId: user.id,
      isShared: createSelectionDto.isShared || false,
    };

    const selection = this.selectionsRepository.create(selectionData);
    return this.selectionsRepository.save(selection);
  }

  async findAll(query: any, user?: User): Promise<any> {
    const { page = 1, limit = 20, isShared, agencyId, userId, search } = query;

    const skip = (page - 1) * limit;

    const qb = this.selectionsRepository
      .createQueryBuilder('selection')
      .leftJoinAndSelect('selection.user', 'user')
      .leftJoinAndSelect('user.agency', 'agency')
      .where('selection.isActive = true');

    // 👇 Проверяем роли
    if (user) {
      const hasRole = (roleName: string) =>
        Array.isArray(user.roles) &&
        user?.roles.some((r) => r.name === roleName);

      // 🔒 Ограничения по ролям
      // — AGENT → только свои подборки
      // — AGENCY_ADMIN → подборки всех агентов своего агентства
      // — ADMIN / SUPERADMIN → все
      if (hasRole('agent')) {
        qb.andWhere('selection.userId = :userId', { userId: user.id });
      } else if (hasRole('agency_admin')) {
        qb.andWhere('user.agencyId = :agencyId', { agencyId: user.agencyId });
      } else if (hasRole('admin') || hasRole('superadmin')) {
        // видит всё — ничего не ограничиваем
      } else {
        // если нет ролей — показываем только свои
        qb.andWhere('selection.userId = :userId', { userId: user.id });
      }
    }

    // 🔹 Фильтр по агентству (если указан явно в query)
    if (agencyId) {
      qb.andWhere('user.agencyId = :agencyId', { agencyId });
    }

    // 🔹 Фильтр по конкретному пользователю
    if (userId) {
      qb.andWhere('selection.userId = :userId', { userId });
    }

    // 🔹 Фильтр по публичности
    if (isShared !== undefined) {
      qb.andWhere('selection.isShared = :isShared', { isShared });
    }

    // 🔹 Поиск по названию или описанию
    if (search) {
      qb.andWhere(
        '(selection.name ILIKE :search OR selection.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('selection.createdAt', 'DESC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    // 📦 Преобразуем в DTO-подобный формат
    const formatted = data.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      isShared: s.isShared,
      createdAt: s.createdAt.toISOString(),
      user: s.user
        ? {
          id: s.user.id,
          firstName: s.user.firstName,
          lastName: s.user.lastName,
          phone: s.user.phone,
          avatar: s.user.avatar,
          agency: s.user.agency
            ? {
              id: s.user.agency.id,
              name: s.user.agency.name,
            }
            : null,
        }
        : null,
    }));

    return {
      data: formatted,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Selection> {
    const selection = await this.selectionsRepository.findOne({
      where: { id, isActive: true },
    });

    if (!selection) {
      throw new NotFoundException('Подборка не найдена');
    }

    return selection;
  }

  async update(
    id: number,
    updateSelectionDto: UpdateSelectionDto,
  ): Promise<Selection> {
    const selection = await this.findOne(id);

    Object.assign(selection, updateSelectionDto);
    return this.selectionsRepository.save(selection);
  }

  async remove(id: number, user: User): Promise<void> {
    const selection = await this.findOne(id);

    if (selection.userId !== user.id) {
      throw new ForbiddenException('Нет прав для удаления этой подборки');
    }

    selection.isActive = false;
    await this.selectionsRepository.save(selection);
  }

  async getPropertiesForSelection(
    selectionId: number,
    user: User,
    pagination?: { page: number; limit: number },
  ): Promise<SelectionWithPropertiesResponseDto> {
    const selection = await this.selectionsRepository.findOne({
      where: { id: selectionId, isActive: true },
      relations: ['user'],
    });

    if (!selection) {
      throw new NotFoundException('Подборка не найдена');
    }

    const createdBy = {
      id: selection.user.id,
      firstName: selection.user.firstName,
      lastName: selection.user.lastName,
      phone: selection.user.phone,
      avatar: selection.user.avatar,
      email: selection.user.email,
    };

    const selectionDto = {
      id: selection.id,
      name: selection.name,
      description: selection.description,
      filters: selection.filters,
      propertyIds: selection.propertyIds,
      isShared: selection.isShared,
      isActive: selection.isActive,
      createdAt: selection.createdAt,
      updatedAt: selection.updatedAt,
    };

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;

    if (selection.propertyIds?.length) {
      const ids = selection.propertyIds.map(Number);
      const total = ids.length;

      if (skip >= total) {
        return {
          selection: selectionDto,
          properties: { data: [], total, page, totalPages: Math.ceil(total / limit) },
          type: 'byIds',
          createdBy,
        };
      }

      const paginatedIds = ids.slice(skip, skip + limit);
      const data = await this.propertiesService.findByIds(paginatedIds);

      return {
        selection: selectionDto,
        properties: {
          data,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
        type: 'byIds',
        createdBy,
      };
    }

    if (selection.filters) {
      const result = await this.propertiesService.findAll(
        {
          ...selection.filters,
          page,
          limit,
        },
        user,
      );

      return {
        selection: selectionDto,
        properties: {
          ...result,
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
        type: 'byFilters',
        createdBy,
      };
    }

    // 🔹 3. Пустая подборка
    return {
      selection: selectionDto,
      properties: { data: [], total: 0, page: 1, totalPages: 0 },
      type: 'empty',
      createdBy,
    };
  }
}
