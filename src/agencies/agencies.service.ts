// src/agencies/agencies.service.ts - дополнительные методы
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from './entities/agency.entity';
import { AgencyDto } from '../auth/dto/register-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency)
    private agenciesRepository: Repository<Agency>,
  ) {}

  async findAll(): Promise<Agency[]> {
    return this.agenciesRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async create(agencyDto: AgencyDto): Promise<Agency> {
    const existingAgency = await this.agenciesRepository.findOne({
      where: { bin: agencyDto.bin },
    });

    if (existingAgency) {
      throw new BadRequestException('Агентство с таким БИН уже существует');
    }

    const agency = this.agenciesRepository.create(agencyDto);
    return this.agenciesRepository.save(agency);
  }

  async findOneById(id: number): Promise<Agency | null> {
    return this.agenciesRepository.findOne({ where: { id } });
  }

  async findOneByBin(bin: string): Promise<Agency | null> {
    return this.agenciesRepository.findOne({ where: { bin } });
  }

  async update(id: number, updateAgencyDto: UpdateAgencyDto): Promise<Agency> {
    const agency = await this.findOneById(id);
    if (!agency) {
      throw new NotFoundException('Агентство не найдено');
    }

    Object.assign(agency, updateAgencyDto);
    return this.agenciesRepository.save(agency);
  }

  async remove(id: number): Promise<void> {
    const agency = await this.findOneById(id);
    if (!agency) {
      throw new NotFoundException('Агентство не найдено');
    }

    // Мягкое удаление - делаем неактивным
    agency.isActive = false;
    await this.agenciesRepository.save(agency);
  }

  async getAgencyUsers(agencyId: number): Promise<any[]> {
    const agency = await this.agenciesRepository.findOne({
      where: { id: agencyId },
      relations: ['users'],
    });

    if (!agency) {
      throw new NotFoundException('Агентство не найдено');
    }

    return agency.users;
  }
}
