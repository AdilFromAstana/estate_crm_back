// src/users/users.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private readonly configService: ConfigService,
  ) { }

  async updateStatus(id: number, isActive: boolean): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    user.isActive = isActive;
    return this.usersRepository.save(user);
  }

  async updateAvatar(userId: number, fileName: string) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    user.avatar = `/uploads${fileName}`;
    await this.usersRepository.save(user);

    return {
      message: 'Аватар обновлён',
      avatarUrl: user.avatar,
    };
  }

  async registerMinimalUser(
    email: string,
    hashedPassword: string, // ← уже хеш!
    agencyId: number,
  ): Promise<User> {
    const realtorRole = await this.rolesRepository.findOne({
      where: { name: 'realtor' },
    });

    if (!realtorRole) {
      throw new Error(
        'Роль "realtor" не найдена. Выполните инициализацию ролей.',
      );
    }

    const user = this.usersRepository.create({
      email,
      password: hashedPassword, // просто сохраняем
      agencyId,
      roles: [realtorRole], // или как у тебя по умолчанию
    });

    return await this.usersRepository.save(user); // ← исправлено: было this.userRepository
  }

  async incrementLoginAttempts(userId: number): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) throw new NotFoundException('Пользователь не найден');
    user.incrementLoginAttempts();
    await this.usersRepository.save(user);
  }

  async resetLoginAttempts(userId: number): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) throw new NotFoundException('Пользователь не найден');
    user.resetLoginAttempts();
    await this.usersRepository.save(user);
  }

  async setRefreshToken(userId: number, token: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: token });
  }

  async clearRefreshToken(userId: number): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: '' });
  }

  async findOneByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { refreshToken } });
  }

  async generatePasswordResetCode(email: string): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) return ''; // не раскрываем существование

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-значный
    user.passwordResetToken = resetCode;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 мин
    await this.usersRepository.save(user);
    return resetCode;
  }

  async resetPasswordWithCode(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }

    if (
      !user.passwordResetToken ||
      user.passwordResetToken !== code ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException(
        'Неверный или просроченный код восстановления',
      );
    }

    user.password = newPassword;
    user.passwordResetToken = '';
    user.refreshToken = ''; // инвалидация всех сессий
    await this.usersRepository.save(user);
  }

  async validatePassword(userId: number, password: string): Promise<boolean> {
    const user = await this.findOneById(userId);
    if (!user) return false;
    return user.validatePassword(password);
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) throw new NotFoundException('Пользователь не найден');
    user.password = newPassword;
    user.refreshToken = ''; // инвалидация сессий
    await this.usersRepository.save(user);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    const roles = await this.rolesRepository.findByIds(createUserDto.roleIds);
    if (roles.length !== createUserDto.roleIds.length) {
      throw new BadRequestException('Одна или несколько ролей не найдены');
    }

    const user = this.usersRepository.create({
      ...createUserDto,
      roles,
      agencyId: createUserDto.agencyId,
    });

    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async blockUser(id: number): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async addRoles(userId: number, roleIds: number[]): Promise<User> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const newRoles = await this.rolesRepository.findByIds(roleIds);
    if (newRoles.length !== roleIds.length) {
      throw new BadRequestException('Одна или несколько ролей не найдены');
    }

    user.roles = [...user.roles, ...newRoles];
    return this.usersRepository.save(user);
  }

  async removeRoles(userId: number, roleIds: number[]): Promise<User> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    user.roles = user.roles.filter((role) => !roleIds.includes(role.id));
    return this.usersRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['roles', 'agency'],
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'agency'],
    });
  }

  async initializeRoles(): Promise<void> {
    const roles = [
      { name: 'admin', description: 'Главный администратор системы' },
      { name: 'agency_admin', description: 'Администратор агентства' },
      { name: 'realtor', description: 'Риэлтор' },
      { name: 'manager', description: 'Менеджер' },
    ];

    for (const roleData of roles) {
      const existingRole = await this.rolesRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.rolesRepository.create(roleData);
        await this.rolesRepository.save(role);
      }
    }
  }

  async findAll(query: GetUsersDto): Promise<any> {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      isVerified,
      role,
      agencyId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.agency', 'agency');

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.firstName ILIKE :search', { search: `%${search}%` })
            .orWhere('user.lastName ILIKE :search', { search: `%${search}%` })
            .orWhere('user.email ILIKE :search', { search: `%${search}%` })
            .orWhere('user.middleName ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    if (isActive) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    if (isVerified) {
      queryBuilder.andWhere('user.isVerified = :isVerified', { isVerified });
    }

    if (role) {
      queryBuilder.andWhere('roles.name = :role', { role });
    }

    if (agencyId) {
      queryBuilder.andWhere('user.agencyId = :agencyId', { agencyId });
    }

    const allowedSortFields = ['firstName', 'lastName', 'email', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`user.${sortField}`, sortOrder);

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // ⭐️ НОВЫЙ ШАГ: Маппинг данных
    const mappedData = plainToInstance(UserResponseDto, data, {
      // Убедитесь, что class-transformer игнорирует поля, которых нет в DTO
      excludeExtraneousValues: true,
    });

    return {
      data: mappedData, // <--- Возвращаем очищенные данные
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['agency'],
    });
    if (!user) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }
    return user;
  }

  async remove(id: number): Promise<{ message: string }> {
    // Проверяем, что пользователь существует и не удалён
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(
        `Пользователь с id ${id} не найден или уже удалён`,
      );
    }

    try {
      await this.usersRepository.update(id, { deletedAt: new Date() });

      return { message: `Пользователь с id ${id} помечен как удалён` };
    } catch (error) {
      throw new InternalServerErrorException(
        `Ошибка при удалении пользователя: ${error.message}`,
      );
    }
  }
}
