import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ValidationPipe,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ComplexesService } from './complexes.service';
import { CreateComplexDto } from './dto/create-complex.dto';
import { UpdateComplexDto } from './dto/update-complex.dto';
import { GetComplexesDto } from './dto/get-complexes.dto';

@ApiTags('Жилые комплексы')
@Controller('complexes')
export class ComplexesController {
  constructor(private readonly complexesService: ComplexesService) {}

  @Post('bulk')
  @ApiOperation({ summary: 'Массовое создание ЖК' })
  async bulkCreate() {
    return this.complexesService.bulkCreate();
  }

  @Get('by-name/:name')
  @ApiOperation({ summary: 'Поиск ЖК по точному названию' })
  async findByName(@Param('name') name: string) {
    const complex = await this.complexesService.findByName(name);
    if (!complex) {
      throw new NotFoundException('ЖК с таким названием не найден');
    }
    return complex;
  }

  @Post()
  @ApiOperation({ summary: 'Создание нового ЖК' })
  @ApiResponse({ status: 201, description: 'ЖК успешно создан' })
  async create(@Body(ValidationPipe) createComplexDto: CreateComplexDto) {
    return this.complexesService.create(createComplexDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка ЖК (с поиском)' })
  @ApiResponse({ status: 200, description: 'Список жилых комплексов' })
  async findAll(@Query(ValidationPipe) query: GetComplexesDto) {
    return this.complexesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение информации о ЖК' })
  @ApiResponse({ status: 200, description: 'Информация о жилом комплексе' })
  async findOne(@Param('id') id: string) {
    return this.complexesService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновление данных ЖК' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateComplexDto: UpdateComplexDto,
  ) {
    return this.complexesService.update(+id, updateComplexDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление ЖК (деактивация)' })
  async remove(@Param('id') id: string) {
    return this.complexesService.remove(+id);
  }
}
