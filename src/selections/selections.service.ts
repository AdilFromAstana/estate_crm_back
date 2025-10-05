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

@Injectable()
export class SelectionsService {
  constructor(
    @InjectRepository(Selection)
    private selectionsRepository: Repository<Selection>,
    private readonly propertiesService: PropertiesService,
  ) {}

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

  async findAll(user: User, sharedOnly: boolean = false): Promise<Selection[]> {
    const where: any = { userId: user.id, isActive: true };

    if (sharedOnly) {
      where.isShared = true;
    }

    return this.selectionsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
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

  // Получение объектов по подборке (универсальный метод)
  async getPropertiesForSelection(
    selectionId: number,
    user: User,
  ): Promise<any> {
    const selection = await this.findOne(selectionId);

    // 1. Подборка по конкретным объектам
    if (selection.propertyIds && selection.propertyIds.length > 0) {
      const ids = selection.propertyIds.map((id) => Number(id));
      const data = await this.propertiesService.findByIds(ids);
      return {
        data,
        total: data.length,
        type: 'byIds',
      };
    }

    // 2. Подборка по фильтрам
    if (selection.filters) {
      const filters = this.transformFilters(selection.filters);

      // ⚡️ ВАЖНО: используем findAll, не getAll
      const { data, total } = await this.propertiesService.findAll(
        filters,
        user,
      );

      return {
        data,
        total,
        type: 'byFilters',
      };
    }

    // 3. Пустая подборка
    return {
      data: [],
      total: 0,
      type: 'empty',
    };
  }

  // Преобразование фильтров в формат PropertiesService
  private transformFilters(filters: any): any {
    const transformed: any = {};

    // Пример преобразования:
    if (filters.rooms) {
      transformed.rooms = filters.rooms;
    }

    if (filters.maxPrice) {
      transformed.maxPrice = filters.maxPrice;
    }

    if (filters.minPrice) {
      transformed.minPrice = filters.minPrice;
    }

    if (filters.district) {
      transformed.district = filters.district;
    }

    // Добавьте другие преобразования по необходимости

    return transformed;
  }

  // Получение публичных подборок
  async getSharedSelections(): Promise<Selection[]> {
    return this.selectionsRepository.find({
      where: { isShared: true, isActive: true },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}
