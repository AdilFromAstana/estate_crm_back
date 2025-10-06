// src/inet-type/inet-type.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InetType } from './entities/inet-type.entity';
import { CreateInetTypeDto } from './dto/create-inet-type.dto';

@Injectable()
export class InetTypeService {
  constructor(
    @InjectRepository(InetType)
    private repo: Repository<InetType>,
  ) {}

  // 🌱 Bulk seed — заполняет из формы
  async seed(): Promise<void> {
    const items = [
      { code: 'adsl', id: '1', name: 'ADSL' },
      { code: 'tv_cable', id: '2', name: 'через TV кабель' },
      { code: 'wired', id: '3', name: 'проводной' },
      { code: 'fiber', id: '4', name: 'оптика' },
    ];

    await this.repo.clear();
    await this.repo.save(items);
  }

  // ➕ Создать
  async create(dto: CreateInetTypeDto): Promise<InetType> {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  // 🔍 Все
  async findAll(): Promise<InetType[]> {
    return this.repo.find();
  }

  // 🔎 По code
  async findOne(code: string): Promise<InetType> {
    const item = await this.repo.findOneBy({ code });
    if (!item) {
      throw new NotFoundException(`InetType with code "${code}" not found`);
    }
    return item;
  }

  // ✏️ Обновить
  async update(
    code: string,
    dto: Partial<CreateInetTypeDto>,
  ): Promise<InetType> {
    const item = await this.findOne(code);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  // 🗑 Удалить
  async delete(code: string): Promise<void> {
    const result = await this.repo.delete({ code });
    if (result.affected === 0) {
      throw new NotFoundException(`InetType with code "${code}" not found`);
    }
  }
}
