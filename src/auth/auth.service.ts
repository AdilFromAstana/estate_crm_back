// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../common/services/mail.service';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/users/entities/user.entity';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (user.isLocked()) {
      throw new UnauthorizedException(
        'Аккаунт заблокирован. Попробуйте позже.',
      );
    }

    const isPasswordValid = await user.validatePassword(loginDto.password);
    if (!isPasswordValid) {
      await this.usersService.incrementLoginAttempts(user.id);
      throw new UnauthorizedException('Неверный email или пароль');
    }

    await this.usersService.resetLoginAttempts(user.id);

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();

    await this.usersService.setRefreshToken(user.id, refreshToken);

    const { password, ...safeUser } = user;
    return {
      accessToken,
      refreshToken,
      user: safeUser,
    };
  }

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, agencyId } = registerDto;

    // но можно оставить дополнительные проверки (опционально)
    if (!email || !email.trim()) {
      throw new BadRequestException('Email обязателен');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new BadRequestException('Некорректный формат email');
    }
    if (!password || password.length < 6) {
      throw new BadRequestException(
        'Пароль должен содержать минимум 6 символов',
      );
    }
    if (!agencyId || agencyId <= 0) {
      throw new BadRequestException('Некорректный ID агентства');
    }

    // 🔹 2. Проверка: существует ли пользователь с таким email
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    // 🔹 Хешируем пароль здесь, в AuthService
    const hashedPassword = await this.hashPassword(password);

    let user: User;
    try {
      // Передаём уже хешированный пароль
      user = await this.usersService.registerMinimalUser(
        email,
        hashedPassword, // ← уже хеш!
        agencyId,
      );
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);

      // Анализ ошибок БД (PostgreSQL)
      if (error?.code === '23502') {
        // NOT NULL violation
        throw new BadRequestException('Отсутствуют обязательные данные');
      }
      if (error?.code === '23505') {
        // Unique violation
        throw new BadRequestException(
          'Пользователь с таким email уже существует',
        );
      }

      throw new InternalServerErrorException('Не удалось создать пользователя');
    }

    // 🔹 4. (Опционально) Отправка email о регистрации
    try {
      await this.mailService.sendRegistrationEmail(email); // ← без пароля!
    } catch (mailError) {
      console.error('Ошибка отправки приветственного письма:', mailError);
      // Не прерываем регистрацию — пользователь создан
    }

    return {
      message:
        'Пользователь успешно зарегистрирован. Вы можете войти в систему.',
    };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findOneByRefreshToken(refreshToken);
    if (!user) {
      throw new UnauthorizedException('Неверный refresh token');
    }

    const payload = { email: user.email, sub: user.id };
    const newAccessToken = this.jwtService.sign(payload);
    const newRefreshToken = uuidv4();

    await this.usersService.setRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const resetCode = await this.usersService.generatePasswordResetCode(email);
    if (resetCode) {
      await this.mailService.sendPasswordResetEmail(email, resetCode);
    }
    // Не раскрываем, существует ли email
    return { message: 'Если email существует, код восстановления отправлен' };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { email, code, newPassword } = resetPasswordDto;
    await this.usersService.resetPasswordWithCode(email, code, newPassword);
    return { message: 'Пароль успешно изменен' };
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const isValid = await this.usersService.validatePassword(
      userId,
      changePasswordDto.currentPassword,
    );
    if (!isValid) {
      throw new BadRequestException('Неверный текущий пароль');
    }

    await this.usersService.updatePassword(
      userId,
      changePasswordDto.newPassword,
    );
    return { message: 'Пароль успешно изменен' };
  }

  async logout(userId: number): Promise<{ message: string }> {
    await this.usersService.clearRefreshToken(userId);
    return { message: 'Выход выполнен успешно' };
  }

  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
