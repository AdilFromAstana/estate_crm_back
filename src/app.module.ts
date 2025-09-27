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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'estate_crm',
      entities: [Agency, User, Role, Property, City, District, Selection],
      synchronize: true,
    }),
    AuthModule,
    AgenciesModule,
    UsersModule,
    PropertiesModule,
    LocationsModule,
    SelectionsModule,
  ],
})
export class AppModule {}
