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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { GetUsersDto } from './dto/get-users.dto';
import {
  UserResponseDto,
  PaginatedUsersResponseDto,
} from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Получение списка пользователей с фильтрацией и пагинацией',
  })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей',
    type: PaginatedUsersResponseDto,
  })
  async findAll(@Query(ValidationPipe) query: GetUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение пользователя по ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создание нового пользователя' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body(ValidationPipe) dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновление данных пользователя' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удаление пользователя' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Пользователь удален' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
