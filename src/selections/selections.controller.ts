// src/selections/selections.controller.ts
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SelectionsService } from './selections.service';
import { CreateSelectionDto } from './dto/create-selection.dto';
import { UpdateSelectionDto } from './dto/update-selection.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/optionalJwtAuthGuard';

@ApiTags('Подборки')
@ApiBearerAuth()
@Controller('selections')
export class SelectionsController {
  constructor(private readonly selectionsService: SelectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Создание новой подборки (по фильтрам или ID объектов)',
  })
  @ApiResponse({ status: 201, description: 'Подборка успешно создана' })
  async create(
    @Body(ValidationPipe) createSelectionDto: CreateSelectionDto,
    @Request() req,
  ) {
    return this.selectionsService.create(createSelectionDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка подборок пользователя' })
  @ApiResponse({ status: 200, description: 'Список подборок' })
  async findAll(@Query('sharedOnly') sharedOnly: boolean, @Request() req) {
    return this.selectionsService.findAll(req.user, sharedOnly);
  }

  @Get('shared')
  @ApiOperation({ summary: 'Получение публичных подборок' })
  @ApiResponse({ status: 200, description: 'Список публичных подборок' })
  async getSharedSelections() {
    return this.selectionsService.getSharedSelections();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получение информации о подборке' })
  @ApiResponse({ status: 200, description: 'Информация о подборке' })
  @ApiResponse({ status: 404, description: 'Подборка не найдена' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.selectionsService.getPropertiesForSelection(+id, req.user);
  }

  @Get(':id/properties')
  @ApiOperation({ summary: 'Получение объектов недвижимости по подборке' })
  @ApiResponse({ status: 200, description: 'Список объектов недвижимости' })
  async getPropertiesForSelection(@Param('id') id: string, @Request() req) {
    return this.selectionsService.getPropertiesForSelection(+id, req.user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновление информации о подборке' })
  @ApiResponse({ status: 200, description: 'Подборка успешно обновлена' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({ status: 404, description: 'Подборка не найдена' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateSelectionDto: UpdateSelectionDto,
    @Request() req,
  ) {
    return this.selectionsService.update(+id, updateSelectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление подборки' })
  @ApiResponse({ status: 200, description: 'Подборка успешно удалена' })
  @ApiResponse({ status: 403, description: 'Нет прав доступа' })
  @ApiResponse({ status: 404, description: 'Подборка не найдена' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.selectionsService.remove(+id, req.user);
  }
}
