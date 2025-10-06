// src/flat-renovation/flat-renovation.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatRenovation } from './entities/flat-renovation.entity';
import { CreateFlatRenovationDto } from './dto/create-flat-renovation.dto';

@Injectable()
export class FlatRenovationService {
  constructor(
    @InjectRepository(FlatRenovation)
    private repo: Repository<FlatRenovation>,
  ) {}

  // 🌱 Bulk seed — заполняет из HTML-формы
  async seed(): Promise<void> {
    const items = [
      { code: 'fresh_renovation', id: '1', name: 'свежий ремонт' },
      {
        code: 'neat_renovation',
        id: '2',
        name: 'не новый, но аккуратный ремонт',
      },
      { code: 'needs_renovation', id: '4', name: 'требует ремонта' },
      { code: 'free_layout', id: '5', name: 'свободная планировка' },
      { code: 'rough_finish', id: '6', name: 'черновая отделка' },
    ];

    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateFlatRenovationDto): Promise<FlatRenovation> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Все
  async findAll(): Promise<FlatRenovation[]> {
    return this.repo.find();
  }

  // 🔎 По code
  async findOne(code: string): Promise<FlatRenovation> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(
        `FlatRenovation with code "${code}" not found`,
      );
    }
    return item;
  }

  // ✏️ Обновить
  async update(
    code: string,
    dto: Partial<CreateFlatRenovationDto>,
  ): Promise<FlatRenovation> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(
        `FlatRenovation with code "${code}" not found`,
      );
    }
  }
}
