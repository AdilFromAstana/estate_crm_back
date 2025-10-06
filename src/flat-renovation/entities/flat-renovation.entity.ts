// src/flat-renovation/entities/flat-renovation.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('flat_renovation')
export class FlatRenovation {
  @PrimaryColumn()
  code: string; // ← основной идентификатор (например, 'fresh_renovation')

  @Column()
  id: string; // ← значение из формы (value="1")

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
