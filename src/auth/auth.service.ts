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

  // src/auth/auth.service.ts

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email } = registerDto;

    // 🔹 1. Валидация email (не пустой, корректный формат)
    if (!email || !email.trim()) {
      throw new BadRequestException('Email обязателен');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new BadRequestException('Некорректный формат email');
    }

    // 🔹 2. Проверка: существует ли пользователь с таким email
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

    // 🔹 3. Генерация временного пароля
    const tempPassword = Math.random().toString(36).slice(-8);
    if (!tempPassword || tempPassword.length < 6) {
      throw new InternalServerErrorException('Не удалось сгенерировать пароль');
    }

    // 🔹 4. Создание пользователя
    let user: User;
    try {
      user = await this.usersService.registerMinimalUser(email, tempPassword);
    } catch (error) {
      // Логируем реальную ошибку (для разработки)
      console.error('Ошибка при создании пользователя:', error);

      // Анализируем ошибку от БД
      if (error?.code === '23502') {
        // NOT NULL violation (PostgreSQL)
        throw new BadRequestException(
          'Отсутствуют обязательные данные (например, agencyId)',
        );
      }
      if (error?.code === '23505') {
        // Unique violation (редкий случай, если проверка выше не сработала)
        throw new BadRequestException(
          'Пользователь с таким email уже существует',
        );
      }

      // Любая другая ошибка
      throw new InternalServerErrorException('Не удалось создать пользователя');
    }

    // 🔹 5. Отправка email
    try {
      await this.mailService.sendRegistrationEmail(email, tempPassword);
    } catch (mailError) {
      console.error('Ошибка отправки email:', mailError);
      // Важно: не отменяем регистрацию, если email не ушёл
      // Но можно уведомить админа или сохранить в очередь
      throw new InternalServerErrorException(
        'Регистрация прошла успешно, но письмо не отправлено. Обратитесь в поддержку.',
      );
    }

    return {
      message:
        'Пользователь успешно зарегистрирован. Временный пароль отправлен на email.',
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
}
