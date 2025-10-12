import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Brackets } from 'typeorm';
import { Complex } from './entities/complex.entity';
import { CreateComplexDto } from './dto/create-complex.dto';
import { UpdateComplexDto } from './dto/update-complex.dto';
import rc_results_final from '../../rc_results_final.json';
import { GetComplexesDto } from './dto/get-complexes.dto';

@Injectable()
export class ComplexesService {
  constructor(
    @InjectRepository(Complex)
    private complexesRepository: Repository<Complex>,
  ) {}

  async bulkCreate(): Promise<Complex[]> {
    const entities = rc_results_final.map(
      (item: { id: string; name: string; details: any }) =>
        this.complexesRepository.create({
          id: Number(item.id),
          name: item.name,
          details: item.details ?? {},
        }),
    );

    return this.complexesRepository.save(entities);
  }

  async searchByName(query: string): Promise<Pick<Complex, 'id' | 'name'>[]> {
    if (!query || query.length < 2) {
      return []; // слишком короткий запрос — не ищем
    }

    return this.complexesRepository.find({
      where: { name: ILike(`%${query}%`), isActive: true },
      select: ['id', 'name'], // 👈 только нужные поля
      take: 10, // максимум 10 подсказок
      order: { name: 'ASC' },
    });
  }

  async findByName(name: string): Promise<Complex | null> {
    return this.complexesRepository.findOne({
      where: { name, isActive: true },
    });
  }

  async create(createComplexDto: CreateComplexDto): Promise<Complex> {
    const complex = this.complexesRepository.create(createComplexDto);
    return this.complexesRepository.save(complex);
  }

  async findAll(query: GetComplexesDto): Promise<any> {
    const {
      page = 1,
      limit = 10,
      search,
      cityId,
      districtId,
      developer,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const qb = this.complexesRepository
      .createQueryBuilder('complex')
      .where('complex.isActive = true');

    // 🔍 Поиск по тексту
    if (search) {
      qb.andWhere(
        new Brackets((qb2) => {
          qb2
            .where('complex.name ILIKE :search', { search: `%${search}%` })
            .orWhere('complex.address ILIKE :search', { search: `%${search}%` })
            .orWhere('complex.district ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('complex.developer ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    // 🏙️ Фильтры
    if (cityId) {
      qb.andWhere('complex.cityId = :cityId', { cityId });
    }

    if (districtId) {
      qb.andWhere('complex.districtId = :districtId', { districtId });
    }

    if (developer) {
      qb.andWhere('complex.developer ILIKE :developer', {
        developer: `%${developer}%`,
      });
    }

    // 📊 Сортировка
    const allowedSortFields = ['createdAt', 'name', 'developer'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`complex.${sortField}`, sortOrder);

    // 📄 Пагинация
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Complex> {
    const complex = await this.complexesRepository.findOne({
      where: { id, isActive: true },
    });

    if (!complex) {
      throw new NotFoundException('Жилой комплекс не найден');
    }

    return complex;
  }

  async update(
    id: number,
    updateComplexDto: UpdateComplexDto,
  ): Promise<Complex> {
    const complex = await this.findOne(id);
    Object.assign(complex, updateComplexDto);
    return this.complexesRepository.save(complex);
  }

  async remove(id: number): Promise<void> {
    const complex = await this.findOne(id);
    complex.isActive = false;
    await this.complexesRepository.save(complex);
  }
}
