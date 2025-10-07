// src/properties/entities/property.entity.ts
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
import { Agency } from '../../agencies/entities/agency.entity';
import { PropertyType } from '../../common/enums/property-type.enum';
import { PropertyTag } from '../../common/enums/property-tag.enum';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyStatus } from '../enums/property-status.enum';

@Entity()
@Index(['agencyId', 'status'])
@Index(['cityId', 'districtId'])
export class Property {
  @ApiProperty({ example: 1, description: 'Уникальный идентификатор' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'Квартира в центре Алматы',
    description: 'Название/заголовок объявления',
  })
  @Column()
  title: string;

  @ApiProperty({
    example: 'Прекрасная квартира в центре города...',
    description: 'Описание недвижимости',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    example: PropertyType.APARTMENT,
    enum: PropertyType,
    description: 'Тип недвижимости',
  })
  @Column({ type: 'enum', enum: PropertyType, default: PropertyType.APARTMENT })
  type: PropertyType;

  @ApiProperty({
    example: PropertyStatus.DRAFT,
    enum: PropertyStatus,
    description: 'Статус недвижимости',
  })
  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.DRAFT,
  })
  status: PropertyStatus;

  @ApiProperty({
    example: [PropertyTag.HOT, PropertyTag.TOP],
    enum: PropertyTag,
    isArray: true,
    description: 'Теги недвижимости',
  })
  @Column({ type: 'simple-array', nullable: true })
  tags: PropertyTag[];

  // Географические данные
  @ApiProperty({ example: 'Астана', description: 'Город' })
  @Column()
  city: string;

  @ApiProperty({ description: 'ID города' })
  @Column()
  cityId: number;

  @ApiProperty({ example: 'Нура р-н', description: 'Район' })
  @Column({ nullable: true })
  district: string;

  @ApiProperty({ description: 'ID района' })
  @Column({ nullable: true })
  districtId: number;

  @ApiProperty({ example: '12 месяцев', description: 'ЖК' })
  @Column({ nullable: true })
  complex: string;

  @ApiProperty({ description: 'ID комплекса' })
  @Column({ nullable: true })
  complexId: number;

  @ApiProperty({ example: 'проспект Абая 123', description: 'Адрес' })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({ example: 43.2389, description: 'Широта' })
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @ApiProperty({ example: 76.8877, description: 'Долгота' })
  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @ApiProperty({ example: 120.5, description: 'Площадь в кв. метрах' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  area: number;

  @ApiProperty({ example: 2, description: 'Количество комнат' })
  @Column({ type: 'int' })
  rooms: number;

  @ApiProperty({ example: 5, description: 'Этаж' })
  @Column({ type: 'int' })
  floor: number;

  @ApiProperty({ example: 9, description: 'Этажность здания' })
  @Column({ type: 'int' })
  totalFloors: number;

  @ApiProperty({ example: 2020, description: 'Год постройки' })
  @Column({ type: 'int', nullable: true })
  yearBuilt: number;

  // Финансовые данные
  @ApiProperty({ example: 25000000, description: 'Цена в тенге' })
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price: number;

  @ApiProperty({ example: 'USD', description: 'Валюта' })
  @Column({ default: 'KZT' })
  currency: string;

  // Связи
  @ApiProperty({ description: 'ID пользователя-владельца' })
  @Column()
  ownerId: number;

  @ManyToOne(() => User, (user) => user.id)
  owner: User;

  @ApiProperty({ description: 'ID агентства' })
  @Column()
  agencyId: number;

  @ManyToOne(() => Agency, (agency) => agency.id)
  agency: Agency;

  @ApiProperty({
    example: 2.8,
    description: 'Высота потолков в метрах',
  })
  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0 })
  ceiling: number;

  @ApiProperty({
    example: [
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg',
    ],
    description: 'URL дополнительных фото',
    required: false,
    isArray: true,
  })
  @Column({ type: 'simple-array', nullable: true })
  photos: string[];

  @Column({ nullable: true, default: '' })
  flatBalconyCode: string;

  @Column({ nullable: true, default: '' })
  buildingTypeCode: string;

  // Состояние — ОДНО значение
  @Column({ nullable: true, default: '' })
  flatRenovationCode: string;

  @Column({ nullable: true, default: '' })
  flatParkingCode: string;

  @Column({ nullable: true, default: '' })
  liveFurnitureCode: string;

  @Column({ nullable: true, default: '' })
  flatToiletCode: string;

  @Column({ type: 'simple-array', nullable: true })
  flatSecurityCodes: string[];

  // Социальные сети для недвижимости (для шаринга)
  @ApiProperty({
    example: 'https://instagram.com/p/property123',
    description: 'Instagram поста о недвижимости',
    required: false,
  })
  @Column({ nullable: true })
  instagramPost: string;

  @ApiProperty({
    example: 'https://tiktok.com/t/property123',
    description: 'TikTok видео о недвижимости',
    required: false,
  })
  @Column({ nullable: true })
  tiktokVideo: string;

  @ApiProperty({ example: true, description: 'Опубликовано' })
  @Column({ default: false })
  isPublished: boolean;

  @ApiProperty({
    example: 'krisha.kz',
    description: 'Сайт парсинга из krisha.kz',
  })
  @Column({ nullable: true })
  importUrl: string;

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
