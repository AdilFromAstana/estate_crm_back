import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplexesService } from './complexes.service';
import { ComplexesController } from './complexes.controller';
import { Complex } from './entities/complex.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Complex])],
  providers: [ComplexesService],
  controllers: [ComplexesController],
  exports: [ComplexesService],
})
export class ComplexesModule {}
