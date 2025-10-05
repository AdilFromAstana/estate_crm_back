// src/flat-security/flat-security.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlatSecurity } from './entities/flat-security.entity';
import { FlatSecurityService } from './flat-security.service';
import { FlatSecurityController } from './flat-security.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FlatSecurity])],
  providers: [FlatSecurityService],
  controllers: [FlatSecurityController],
  exports: [FlatSecurityService], // если нужен в других модулях
})
export class FlatSecurityModule {}
