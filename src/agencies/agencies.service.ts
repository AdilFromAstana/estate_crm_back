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
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency)
    private agenciesRepository: Repository<Agency>,

    @InjectRepository(User) // ✅ добавляем
    private usersRepository: Repository<User>,
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

  async getAgencyUsers(
    agencyId: number,
    options: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      sortBy: string;
      sortDirection: 'ASC' | 'DESC';
    },
  ) {
    const qb = this.usersRepository // 👈 делаем запрос из User
      .createQueryBuilder('user')
      .where('user.agencyId = :agencyId', { agencyId });

    if (options.search) {
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options.status === 'active') {
      qb.andWhere('user.isActive = true');
    }
    if (options.status === 'inactive') {
      qb.andWhere('user.isActive = false');
    }
    if (options.status === 'pending') {
      qb.andWhere('user.isVerified = false');
    }

    qb.orderBy(`user.${options.sortBy}`, options.sortDirection);

    qb.skip((options.page - 1) * options.limit).take(options.limit);

    const [users, total] = await qb.getManyAndCount();

    return {
      data: users,
      total,
      page: options.page,
      limit: options.limit,
    };
  }
}
