// src/live-furniture/live-furniture.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveFurniture } from './entities/live-furniture.entity';
import { CreateLiveFurnitureDto } from './dto/create-live-furniture.dto';

@Injectable()
export class LiveFurnitureService {
  constructor(
    @InjectRepository(LiveFurniture)
    private repo: Repository<LiveFurniture>,
  ) {}

  // 🌱 Bulk seed — заполняет из формы
  async seed(): Promise<void> {
    const items = [
      { code: 'fully', id: '1', name: 'полностью' },
      { code: 'partially', id: '2', name: 'частично' },
      { code: 'none', id: '3', name: 'без мебели' },
    ];

    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateLiveFurnitureDto): Promise<LiveFurniture> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Все
  async findAll(): Promise<LiveFurniture[]> {
    return this.repo.find();
  }

  // 🔎 По code
  async findOne(code: string): Promise<LiveFurniture> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(
        `LiveFurniture with code "${code}" not found`,
      );
    }
    return item;
  }

  // ✏️ Обновить
  async update(
    code: string,
    dto: Partial<CreateLiveFurnitureDto>,
  ): Promise<LiveFurniture> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(
        `LiveFurniture with code "${code}" not found`,
      );
    }
  }
}
