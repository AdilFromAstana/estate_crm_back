// src/common/services/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    const user = configService.get<string>('MAIL_USER');
    const pass = configService.get<string>('MAIL_PASS');

    if (!user || !pass) {
      throw new Error('MAIL_USER и MAIL_PASS должны быть заданы в .env файле');
    }

    this.transporter = nodemailer.createTransport({
      host: configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
      port: configService.get<number>('MAIL_PORT') || 587,
      secure: false,
      auth: { user, pass },
    });
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<void> {
    const mailOptions = {
      from:
        this.configService.get<string>('MAIL_FROM') ||
        this.configService.get<string>('MAIL_USER'),
      to: email,
      subject: 'Восстановление пароля',
      text: `Ваш код для восстановления пароля: ${code}`,
      html: `
        <h2>Восстановление пароля</h2>
        <p>Ваш код для восстановления пароля: <strong>${code}</strong></p>
        <p>Код действителен в течение 15 минут.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendRegistrationEmail(email: string): Promise<void> {
    const mailOptions = {
      from:
        this.configService.get<string>('MAIL_FROM') ||
        this.configService.get<string>('MAIL_USER'),
      to: email,
      subject: 'Регистрация в системе',
      html: `
        <h2>Добро пожаловать в систему!</h2>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
