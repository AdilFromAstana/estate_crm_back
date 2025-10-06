// src/flat-door/flat-door.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatDoor } from './entities/flat-door.entity';
import { CreateFlatDoorDto } from './dto/create-flat-door.dto';

@Injectable()
export class FlatDoorService {
  constructor(
    @InjectRepository(FlatDoor)
    private repo: Repository<FlatDoor>,
  ) {}

  // 🌱 Bulk seed — заполняет из формы
  async seed(): Promise<void> {
    const items = [
      { code: 'wooden', id: '1', name: 'деревянная' },
      { code: 'metal', id: '2', name: 'металлическая' },
      { code: 'armored', id: '3', name: 'бронированная' },
    ];

    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateFlatDoorDto): Promise<FlatDoor> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Все
  async findAll(): Promise<FlatDoor[]> {
    return this.repo.find();
  }

  // 🔎 По code
  async findOne(code: string): Promise<FlatDoor> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(`FlatDoor with code "${code}" not found`);
    }
    return item;
  }

  // ✏️ Обновить
  async update(
    code: string,
    dto: Partial<CreateFlatDoorDto>,
  ): Promise<FlatDoor> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(`FlatDoor with code "${code}" not found`);
    }
  }
}
