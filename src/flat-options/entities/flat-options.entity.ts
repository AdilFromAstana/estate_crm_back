// src/flat-options/entities/flat-options.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('flat_options')
export class FlatOptions {
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
