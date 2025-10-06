// src/flat-parking/flat-parking.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatParking } from './entities/flat-parking.entity';
import { CreateFlatParkingDto } from './dto/create-flat-parking.dto';

@Injectable()
export class FlatParkingService {
  constructor(
    @InjectRepository(FlatParking)
    private repo: Repository<FlatParking>,
  ) {}

  // 🌱 Bulk seed — заполняет из формы
  async seed(): Promise<void> {
    const items = [
      { code: 'parking', id: '1', name: 'паркинг' },
      { code: 'garage', id: '2', name: 'гараж' },
      {
        code: 'guarded_parking_nearby',
        id: '3',
        name: 'рядом охраняемая стоянка',
      },
    ];

    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateFlatParkingDto): Promise<FlatParking> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Все
  async findAll(): Promise<FlatParking[]> {
    return this.repo.find();
  }

  // 🔎 По code
  async findOne(code: string): Promise<FlatParking> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(`FlatParking with code "${code}" not found`);
    }
    return item;
  }

  // ✏️ Обновить
  async update(
    code: string,
    dto: Partial<CreateFlatParkingDto>,
  ): Promise<FlatParking> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(`FlatParking with code "${code}" not found`);
    }
  }
}
