// src/flat-security/flat-security.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlatSecurity } from './entities/flat-security.entity';
import { CreateFlatSecurityDto } from './dto/create-flat-security.dto';

@Injectable()
export class FlatSecurityService {
  constructor(
    @InjectRepository(FlatSecurity)
    private repo: Repository<FlatSecurity>,
  ) {}

  // 🌱 Bulk seed — заполнить из HTML-формы
  async seed(): Promise<void> {
    const items = [
      { code: 'window_grates', id: '1', name: 'решетки на окнах' },
      { code: 'security', id: '2', name: 'охрана' },
      { code: 'intercom', id: '3', name: 'домофон' },
      { code: 'code_lock', id: '4', name: 'кодовый замок' },
      { code: 'alarm', id: '5', name: 'сигнализация' },
      { code: 'video_surveillance', id: '6', name: 'видеонаблюдение' },
      { code: 'video_intercom', id: '7', name: 'видеодомофон' },
      { code: 'concierge', id: '8', name: 'консьерж' },
    ];

    // Очистить и вставить заново (идемпотентность)
    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateFlatSecurityDto): Promise<FlatSecurity> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Найти все
  async findAll(): Promise<FlatSecurity[]> {
    return this.repo.find();
  }

  // 🔎 Найти по code
  async findOne(code: string): Promise<FlatSecurity> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(`FlatSecurity with code "${code}" not found`);
    }
    return item;
  }

  // ✏️ Обновить по code
  async update(
    code: string,
    dto: Partial<CreateFlatSecurityDto>,
  ): Promise<FlatSecurity> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить по code
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(`FlatSecurity with code "${code}" not found`);
    }
  }
}
