// src/flat-toilet/flat-toilet.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatToilet } from './entities/flat-toilet.entity';
import { CreateFlatToiletDto } from './dto/create-flat-toilet.dto';

@Injectable()
export class FlatToiletService {
  constructor(
    @InjectRepository(FlatToilet)
    private repo: Repository<FlatToilet>,
  ) {}

  // 🌱 Bulk seed — заполняет из формы
  async seed(): Promise<void> {
    const items = [
      { code: 'separate', id: '1', name: 'раздельный' },
      { code: 'combined', id: '2', name: 'совмещенный' },
      { code: 'two_or_more', id: '3', name: '2 с/у и более' },
      { code: 'none', id: '4', name: 'нет' },
    ];

    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateFlatToiletDto): Promise<FlatToilet> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Все
  async findAll(): Promise<FlatToilet[]> {
    return this.repo.find();
  }

  // 🔎 По code
  async findOne(code: string): Promise<FlatToilet> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(`FlatToilet with code "${code}" not found`);
    }
    return item;
  }

  // ✏️ Обновить
  async update(
    code: string,
    dto: Partial<CreateFlatToiletDto>,
  ): Promise<FlatToilet> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(`FlatToilet with code "${code}" not found`);
    }
  }
}
