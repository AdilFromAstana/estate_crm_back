// src/flat-building/flat-building.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatBuilding } from './entities/flat-building.entity';
import { CreateFlatBuildingDto } from './dto/create-flat-building.dto';

@Injectable()
export class FlatBuildingService {
  constructor(
    @InjectRepository(FlatBuilding)
    private repo: Repository<FlatBuilding>,
  ) {}

  // 🌱 Bulk seed — заполняет из формы
  async seed(): Promise<void> {
    const items = [
      { code: 'brick', id: '1', name: 'кирпичный' },
      { code: 'panel', id: '2', name: 'панельный' },
      { code: 'monolith', id: '3', name: 'монолитный' },
      { code: 'other', id: '0', name: 'иной' },
    ];

    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateFlatBuildingDto): Promise<FlatBuilding> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Все
  async findAll(): Promise<FlatBuilding[]> {
    return this.repo.find();
  }

  // 🔎 По code
  async findOne(code: string): Promise<FlatBuilding> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(`FlatBuilding with code "${code}" not found`);
    }
    return item;
  }

  // ✏️ Обновить
  async update(
    code: string,
    dto: Partial<CreateFlatBuildingDto>,
  ): Promise<FlatBuilding> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(`FlatBuilding with code "${code}" not found`);
    }
  }
}
