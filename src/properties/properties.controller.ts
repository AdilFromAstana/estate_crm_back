// src/properties/properties.controller.ts
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
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { GetPropertiesDto } from './dto/get-properties.dto';
import { PropertyStatus } from '../common/enums/property-status.enum';
import { PropertyTag } from '../common/enums/property-tag.enum';
import { ParsePageDto } from './dto/parse-page.dto';

@ApiTags('Недвижимость')
@ApiBearerAuth()
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post('parse')
  @ApiOperation({ summary: 'Парсинг данных с внешней страницы' })
  @ApiBody({ type: ParsePageDto })
  @ApiOkResponse({ description: 'Данные успешно спаршены' })
  async parsePage(@Body() parsePageDto: ParsePageDto) {
    return this.propertiesService.parsePage(parsePageDto);
  }

  @Post()
  @ApiOperation({ summary: 'Создание новой недвижимости' })
  @ApiResponse({ status: 201, description: 'Недвижимость успешно создана' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  async create(
    @Body(ValidationPipe) createPropertyDto: CreatePropertyDto,
    @Request() req,
  ) {
    return this.propertiesService.create(createPropertyDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка недвижимости с фильтрацией' })
  @ApiResponse({ status: 200, description: 'Список недвижимости' })
  async findAll(
    @Query(ValidationPipe) query: GetPropertiesDto,
    @Request() req,
  ) {
    return this.propertiesService.findAll(query, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение информации о недвижимости' })
  @ApiResponse({ status: 200, description: 'Информация о недвижимости' })
  @ApiResponse({ status: 404, description: 'Недвижимость не найдена' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.propertiesService.findOne(+id, req.user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновление информации о недвижимости' })
  @ApiResponse({ status: 200, description: 'Недвижимость успешно обновлена' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({ status: 404, description: 'Недвижимость не найдена' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updatePropertyDto: UpdatePropertyDto,
    @Request() req,
  ) {
    return this.propertiesService.update(+id, updatePropertyDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление недвижимости' })
  @ApiResponse({ status: 200, description: 'Недвижимость успешно удалена' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({ status: 404, description: 'Недвижимость не найдена' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.propertiesService.remove(+id, req.user);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Изменение статуса недвижимости' })
  @ApiResponse({ status: 200, description: 'Статус успешно изменен' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({ status: 404, description: 'Недвижимость не найдена' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: PropertyStatus,
    @Request() req,
  ) {
    return this.propertiesService.updateStatus(+id, status, req.user);
  }

  @Post(':id/tags/:tag')
  @ApiOperation({ summary: 'Добавление тега к недвижимости' })
  @ApiResponse({ status: 200, description: 'Тег успешно добавлен' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({ status: 404, description: 'Недвижимость не найдена' })
  async addTag(
    @Param('id') id: string,
    @Param('tag') tag: PropertyTag,
    @Request() req,
  ) {
    return this.propertiesService.addTag(+id, tag, req.user);
  }

  @Delete(':id/tags/:tag')
  @ApiOperation({ summary: 'Удаление тега из недвижимости' })
  @ApiResponse({ status: 200, description: 'Тег успешно удален' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({ status: 404, description: 'Недвижимость не найдена' })
  async removeTag(
    @Param('id') id: string,
    @Param('tag') tag: PropertyTag,
    @Request() req,
  ) {
    return this.propertiesService.removeTag(+id, tag, req.user);
  }
}
