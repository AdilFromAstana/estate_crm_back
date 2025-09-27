// src/agencies/entities/agency.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Agency {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Топ Риэлт', description: 'Название агентства' })
  @Column()
  name: string;

  @ApiProperty({
    example: '+7 (777) 123-45-67',
    description: 'Телефон агентства',
  })
  @Column()
  phone: string;

  @ApiProperty({ example: '123456789012', description: 'БИН агентства' })
  @Column()
  bin: string;

  @ApiProperty({
    example: '123456789',
    description: 'КБЕ агентства',
    required: false,
  })
  @Column({ nullable: true })
  kbe: string;

  // Социальные сети компании
  @ApiProperty({
    example: 'https://instagram.com/topreal_kz',
    description: 'Instagram компании',
    required: false,
  })
  @Column({ nullable: true })
  instagram: string;

  @ApiProperty({
    example: 'https://tiktok.com/@topreal_kz',
    description: 'TikTok компании',
    required: false,
  })
  @Column({ nullable: true })
  tiktok: string;

  @ApiProperty({ example: true, description: 'Статус активности' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Дата создания',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Дата обновления',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.agency)
  users: User[];
}
