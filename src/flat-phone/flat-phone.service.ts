// src/flat-phone/flat-phone.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatPhone } from './entities/flat-phone.entity';
import { CreateFlatPhoneDto } from './dto/create-flat-phone.dto';

@Injectable()
export class FlatPhoneService {
  constructor(
    @InjectRepository(FlatPhone)
    private repo: Repository<FlatPhone>,
  ) {}

  // 🌱 Bulk seed — заполняет из формы
  async seed(): Promise<void> {
    const items = [
      { code: 'separate', id: '1', name: 'отдельный' },
      { code: 'blocker', id: '2', name: 'блокиратор' },
      {
        code: 'can_be_connected',
        id: '3',
        name: 'есть возможность подключения',
      },
      { code: 'none', id: '4', name: 'нет' },
    ];

    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateFlatPhoneDto): Promise<FlatPhone> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Все
  async findAll(): Promise<FlatPhone[]> {
    return this.repo.find();
  }

  // 🔎 По code
  async findOne(code: string): Promise<FlatPhone> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(`FlatPhone with code "${code}" not found`);
    }
    return item;
  }

  // ✏️ Обновить
  async update(
    code: string,
    dto: Partial<CreateFlatPhoneDto>,
  ): Promise<FlatPhone> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(`FlatPhone with code "${code}" not found`);
    }
  }
}
