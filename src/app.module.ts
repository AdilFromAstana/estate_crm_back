// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AgenciesModule } from './agencies/agencies.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { LocationsModule } from './locations/locations.module';
import { Agency } from './agencies/entities/agency.entity';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { Property } from './properties/entities/property.entity';
import { City } from './locations/entities/city.entity';
import { Selection } from './selections/entities/selection.entity';
import { District } from './locations/entities/district.entity';
import { SelectionsModule } from './selections/selections.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { Complex } from './complexes/entities/complex.entity';
import { ComplexesModule } from './complexes/complexes.module';
import { FlatSecurity } from './flat-security/entities/flat-security.entity';
import { FlatSecurityModule } from './flat-security/flat-security.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('DB_HOST');
        const port = config.get<number>('DB_PORT');
        const username = config.get<string>('DB_USERNAME');
        const password = config.get<string>('DB_PASSWORD');
        const database = config.get<string>('DB_DATABASE');

        // 🛑 Валидация обязательных переменных
        if (!host || !port || !username || !password || !database) {
          throw new Error(
            `❌ Database config is invalid. 
            DB_HOST=${host}, 
            DB_PORT=${port}, 
            DB_USERNAME=${username}, 
            DB_PASSWORD=${password ? '***' : '(empty)'}, 
            DB_DATABASE=${database}`,
          );
        }

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [
            Agency,
            User,
            Role,
            Property,
            City,
            District,
            Selection,
            Complex,
            FlatSecurity,
          ],
          synchronize: true,
        };
      },
    }),
    AuthModule,
    AgenciesModule,
    UsersModule,
    PropertiesModule,
    LocationsModule,
    SelectionsModule,
    ComplexesModule,
    FlatSecurityModule,
    MulterModule.register({
      dest: join(__dirname, '..', 'uploads', 'images'), // папка для сохранения
    }),
  ],
})
export class AppModule {}
