// src/agencies/agencies.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgenciesService } from './agencies.service';
import { AgenciesController } from './agencies.controller';
import { Agency } from './entities/agency.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agency, User])],
  providers: [AgenciesService],
  controllers: [AgenciesController],
  exports: [AgenciesService],
})
export class AgenciesModule {}
