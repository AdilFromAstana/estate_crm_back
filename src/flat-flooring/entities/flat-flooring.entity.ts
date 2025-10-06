// src/flat-flooring/entities/flat-flooring.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('flat_flooring')
export class FlatFlooring {
  @PrimaryColumn()
  code: string;

  @Column()
  id: string; // значение из формы (value="1")

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
