// src/selections/entities/selection.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['userId', 'name'])
@Index(['userId', 'isShared'])
export class Selection {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Трешки в Медеуском',
    description: 'Название подборки',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Все трешки в Медеуском районе',
    description: 'Описание подборки',
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  // Вариант 1: Сохраненные фильтры
  @ApiProperty({
    example: { rooms: 3, maxPrice: 50000000 },
    description: 'Параметры фильтрации в JSON',
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  filters: any; // Объект с параметрами фильтрации

  // Вариант 2: Конкретные ID объектов
  @ApiProperty({
    example: [1, 2, 3],
    description: 'ID конкретных объектов недвижимости',
    required: false,
    isArray: true,
  })
  @Column({ type: 'int', array: true, nullable: true }) // ✅ массив чисел в Postgres
  propertyIds: number[];

  @ApiProperty({ example: true, description: 'Общедоступная подборка' })
  @Column({ default: false })
  isShared: boolean;

  @ApiProperty({ example: true, description: 'Активна' })
  @Column({ default: true })
  isActive: boolean;

  // Связи
  @ApiProperty({ description: 'ID пользователя' })
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Дата создания',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Дата обновления',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
