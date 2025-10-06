// src/flat-balcony/flat-balcony.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatBalcony } from './entities/flat-balcony.entity';
import { CreateFlatBalconyDto } from './dto/create-flat-balcony.dto';

@Injectable()
export class FlatBalconyService {
  constructor(
    @InjectRepository(FlatBalcony)
    private repo: Repository<FlatBalcony>,
  ) {}

  // 🌱 Bulk seed — заполняет из формы
  async seed(): Promise<void> {
    const items = [
      { code: 'balcony', id: '1', name: 'балкон' },
      { code: 'loggia', id: '2', name: 'лоджия' },
      { code: 'balcony_and_loggia', id: '3', name: 'балкон и лоджия' },
      { code: 'multiple', id: '4', name: 'несколько балконов или лоджий' },
    ];

    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateFlatBalconyDto): Promise<FlatBalcony> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Все
  async findAll(): Promise<FlatBalcony[]> {
    return this.repo.find();
  }

  // 🔎 По code
  async findOne(code: string): Promise<FlatBalcony> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(`FlatBalcony with code "${code}" not found`);
    }
    return item;
  }

  // ✏️ Обновить
  async update(
    code: string,
    dto: Partial<CreateFlatBalconyDto>,
  ): Promise<FlatBalcony> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(`FlatBalcony with code "${code}" not found`);
    }
  }
}
