// src/inet-type/entities/inet-type.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('inet_type')
export class InetType {
  @PrimaryColumn()
  code: string; // ← стабильный ключ: 'adsl', 'tv_cable' и т.д.

  @Column()
  id: string; // ← значение из формы (value="1")

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
