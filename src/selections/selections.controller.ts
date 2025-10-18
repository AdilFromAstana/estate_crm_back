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
  Req,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SelectionsService } from './selections.service';
import { CreateSelectionDto } from './dto/create-selection.dto';
import { UpdateSelectionDto } from './dto/update-selection.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/optionalJwtAuthGuard';
import { SelectionWithPropertiesResponseDto } from './dto/selection-properties-response.dto';

@ApiTags('Подборки')
@ApiBearerAuth()
@Controller('selections')
export class SelectionsController {
  constructor(private readonly selectionsService: SelectionsService) { }

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
  @ApiOperation({ summary: 'Получение списка подборок с фильтрами и ролями' })
  @ApiResponse({ status: 200, description: 'Список подборок' })
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@Query() query: any, @Request() req) {
    return this.selectionsService.findAll(query, req.user);
  }

  @ApiOkResponse({
    type: SelectionWithPropertiesResponseDto,
    description: 'Подборка с объектами недвижимости и информацией об авторе',
  })
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получить подборку с объектами (с пагинацией)' })
  @ApiOkResponse({ type: SelectionWithPropertiesResponseDto })
  async findOneWithProperties(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req: any,
  ): Promise<SelectionWithPropertiesResponseDto> {
    return this.selectionsService.getPropertiesForSelection(id, req.user, { page, limit });
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
