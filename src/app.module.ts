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
import { FlatBalcony } from './flat-balcony/entities/flat-balcony.entity';
import { FlatDoor } from './flat-door/entities/flat-door.entity';
import { FlatFlooring } from './flat-flooring/entities/flat-flooring.entity';
import { FlatOptions } from './flat-options/entities/flat-options.entity';
import { FlatParking } from './flat-parking/entities/flat-parking.entity';
import { FlatPhone } from './flat-phone/entities/flat-phone.entity';
import { FlatRenovation } from './flat-renovation/entities/flat-renovation.entity';
import { FlatToilet } from './flat-toilet/entities/flat-toilet.entity';
import { InetType } from './inet-type/entities/inet-type.entity';
import { LiveFurniture } from './live-furniture/entities/live-furniture.entity';
import { FlatBalconyModule } from './flat-balcony/flat-balcony.module';
import { FlatDoorModule } from './flat-door/flat-door.module';
import { FlatFlooringModule } from './flat-flooring/flat-flooring.module';
import { FlatOptionsModule } from './flat-options/flat-options.module';
import { FlatParkingModule } from './flat-parking/flat-parking.module';
import { FlatPhoneModule } from './flat-phone/flat-phone.module';
import { FlatRenovationModule } from './flat-renovation/flat-renovation.module';
import { FlatToiletModule } from './flat-toilet/flat-toilet.module';
import { InetTypeModule } from './inet-type/inet-type.module';
import { LiveFurnitureModule } from './live-furniture/live-furniture.module';
import { FlatBuilding } from './flat-building/entities/flat-building.entity';
import { FlatBuildingModule } from './flat-building/flat-building.module';

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
            FlatBalcony,
            FlatDoor,
            FlatFlooring,
            FlatOptions,
            FlatParking,
            FlatPhone,
            FlatRenovation,
            FlatToilet,
            InetType,
            LiveFurniture,
            FlatBuilding,
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
    FlatBalconyModule,
    FlatDoorModule,
    FlatFlooringModule,
    FlatOptionsModule,
    FlatParkingModule,
    FlatPhoneModule,
    FlatRenovationModule,
    FlatToiletModule,
    InetTypeModule,
    LiveFurnitureModule,
    FlatBuildingModule,
    MulterModule.register({
      dest: join(__dirname, '..', 'uploads', 'images'), // папка для сохранения
    }),
  ],
})
export class AppModule {}
