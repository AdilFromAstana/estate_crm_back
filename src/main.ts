import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { join } from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
const basicAuth = require('express-basic-auth');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 💥 Увеличиваем лимит тела запроса (например до 50MB)
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(new ValidationPipe());

  const usersService = app.get(UsersService);
  await usersService.initializeRoles();

  // 👇 Basic Auth только для Swagger
  if (process.env.NODE_ENV === 'production') {
    app.use(
      ['/swagger'],
      basicAuth({
        challenge: true,
        users: {
          admin: process.env.SWAGGER_PASSWORD,
        },
      }),
    );
  }

  const configBuilder = new DocumentBuilder()
    .setTitle('Риэлторское агентство API')
    .setDescription('API для управления риэлторским агентством Казахстана')
    .setVersion('1.0')
    .addBearerAuth();

  if (process.env.NODE_ENV === 'production') {
    configBuilder.addServer('/api');
  }

  const config = configBuilder.build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // ✅ Универсальная статика
  const isProd = process.env.NODE_ENV === 'production';
  const uploadsPath = join(__dirname, '../..', 'uploads');
  const uploadsRoute = isProd ? '/api/uploads' : '/uploads';

  app.use(uploadsRoute, express.static(uploadsPath));

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = 3000;
  await app.listen(port);

  // 👇 Выводим в консоль финальный URL для статики
  const baseUrl = isProd
    ? `https://juz-realestate.kz${uploadsRoute}`
    : `http://localhost:${port}${uploadsRoute}`;

  console.log('🚀 Application is running on:', await app.getUrl());
  console.log('📂 Static uploads are served from:', uploadsPath);
  console.log('🌍 Public URL for uploads:', baseUrl);
}

bootstrap();
