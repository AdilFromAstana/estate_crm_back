// src/flat-options/flat-options.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatOptions } from './entities/flat-options.entity';
import { CreateFlatOptionsDto } from './dto/create-flat-options.dto';

@Injectable()
export class FlatOptionsService {
  constructor(
    @InjectRepository(FlatOptions)
    private repo: Repository<FlatOptions>,
  ) {}

  // 🌱 Bulk seed — заполняет из формы
  async seed(): Promise<void> {
    const items = [
      { code: 'plastic_windows', id: '1', name: 'пластиковые окна' },
      { code: 'non_corner', id: '2', name: 'неугловая' },
      { code: 'improved', id: '3', name: 'улучшенная' },
      { code: 'isolated_rooms', id: '4', name: 'комнаты изолированы' },
      { code: 'studio_kitchen', id: '5', name: 'кухня-студия' },
      { code: 'built_in_kitchen', id: '6', name: 'встроенная кухня' },
      { code: 'new_plumbing', id: '7', name: 'новая сантехника' },
      { code: 'storage_room', id: '8', name: 'кладовка' },
      { code: 'meters', id: '9', name: 'счётчики' },
      { code: 'quiet_yard', id: '10', name: 'тихий двор' },
      { code: 'air_conditioning', id: '11', name: 'кондиционер' },
      { code: 'good_for_business', id: '12', name: 'удобно под коммерцию' },
    ];

    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateFlatOptionsDto): Promise<FlatOptions> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Все
  async findAll(): Promise<FlatOptions[]> {
    return this.repo.find();
  }

  // 🔎 По code
  async findOne(code: string): Promise<FlatOptions> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(`FlatOptions with code "${code}" not found`);
    }
    return item;
  }

  // ✏️ Обновить
  async update(
    code: string,
    dto: Partial<CreateFlatOptionsDto>,
  ): Promise<FlatOptions> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(`FlatOptions with code "${code}" not found`);
    }
  }
}
