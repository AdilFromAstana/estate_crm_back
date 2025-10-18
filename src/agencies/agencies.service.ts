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
import { Brackets } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency)
    private agenciesRepository: Repository<Agency>,

    @InjectRepository(User) // ✅ добавляем
    private usersRepository: Repository<User>,
  ) { }

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

    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'createdAt',
      sortDirection = 'ASC',
    } = options;

    const skip = (page - 1) * limit;

    const qb = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles') // ✅ Добавим, чтобы DTO мог их отобразить
      .leftJoinAndSelect('user.agency', 'agency') // ✅ Добавим, чтобы DTO мог их отобразить
      .where('user.agencyId = :agencyId', { agencyId });

    if (search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('user.firstName ILIKE :search', { search: `%${search}%` })
            .orWhere('user.lastName ILIKE :search', { search: `%${search}%` })
            .orWhere('user.email ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (status === 'active') {
      qb.andWhere('user.isActive = true');
    }
    if (status === 'inactive') {
      qb.andWhere('user.isActive = false');
    }
    if (status === 'pending') {
      qb.andWhere('user.isVerified = false');
    }

    // ВАЖНО: нужно добавить agency и roles в JOIN, чтобы DTO мог их заполнить

    // Ограничим разрешенные поля для сортировки
    const allowedSortFields = ['firstName', 'lastName', 'email', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    qb.orderBy(`user.${sortField}`, sortDirection);

    qb.skip(skip).take(limit);

    const [users, total] = await qb.getManyAndCount();

    // ⭐️ КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Маппинг данных
    const mappedUsers = plainToInstance(UserResponseDto, users, {
      excludeExtraneousValues: true,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: mappedUsers, // ✅ Отправляем очищенные данные
      total,
      page,
      limit,
      totalPages,
    }
  }
}
