// src/flat-phone/entities/flat-phone.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('flat_phone')
export class FlatPhone {
  @PrimaryColumn()
  code: string; // ← стабильный ключ: 'separate', 'blocker' и т.д.

  @Column()
  id: string; // ← значение из формы (value="1")

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
