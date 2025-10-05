import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Complex } from './entities/complex.entity';
import { CreateComplexDto } from './dto/create-complex.dto';
import { UpdateComplexDto } from './dto/update-complex.dto';
import { BulkComplexItemDto } from './dto/bulk-create-complex.dto';
import rc_results_final from '../../rc_results_final.json';

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

  async create(createComplexDto: CreateComplexDto): Promise<Complex> {
    const complex = this.complexesRepository.create(createComplexDto);
    return this.complexesRepository.save(complex);
  }

  async findAll(search?: string): Promise<Complex[]> {
    const where: any = { isActive: true };

    if (search) {
      // Поиск по имени, адресу, району, застройщику (LIKE)
      where['name'] = ILike(`%${search}%`);
      // Можно добавить более сложный вариант OR-условий:
      return this.complexesRepository
        .createQueryBuilder('complex')
        .where('complex.isActive = true')
        .andWhere(
          '(complex.name ILIKE :search OR complex.address ILIKE :search OR complex.district ILIKE :search OR complex.developer ILIKE :search)',
          { search: `%${search}%` },
        )
        .orderBy('complex.createdAt', 'DESC')
        .getMany();
    }

    return this.complexesRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
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
