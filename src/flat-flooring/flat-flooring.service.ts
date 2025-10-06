// src/flat-flooring/flat-flooring.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatFlooring } from './entities/flat-flooring.entity';
import { CreateFlatFlooringDto } from './dto/create-flat-flooring.dto';

@Injectable()
export class FlatFlooringService {
  constructor(
    @InjectRepository(FlatFlooring)
    private repo: Repository<FlatFlooring>,
  ) {}

  // 🌱 Bulk seed — заполняет из формы
  async seed(): Promise<void> {
    const items = [
      { code: 'linoleum', id: '1', name: 'линолеум' },
      { code: 'parquet', id: '2', name: 'паркет' },
      { code: 'laminate', id: '3', name: 'ламинат' },
      { code: 'wood', id: '4', name: 'дерево' },
      { code: 'carpet', id: '5', name: 'ковролан' },
      { code: 'tile', id: '6', name: 'плитка' },
      { code: 'cork', id: '7', name: 'пробковый' },
    ];

    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateFlatFlooringDto): Promise<FlatFlooring> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Все
  async findAll(): Promise<FlatFlooring[]> {
    return this.repo.find();
  }

  // 🔎 По code
  async findOne(code: string): Promise<FlatFlooring> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(`FlatFlooring with code "${code}" not found`);
    }
    return item;
  }

  // ✏️ Обновить
  async update(
    code: string,
    dto: Partial<CreateFlatFlooringDto>,
  ): Promise<FlatFlooring> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(`FlatFlooring with code "${code}" not found`);
    }
  }
}
