// src/flat-balcony/entities/flat-balcony.entity.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('flat_balcony')
export class FlatBalcony {
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