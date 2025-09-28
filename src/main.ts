import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { UsersService } from './users/users.service';
const basicAuth = require('express-basic-auth');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
          admin: process.env.SWAGGER_PASSWORD, // логин: admin
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

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
