// src/flat-parking/entities/flat-parking.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('flat_parking')
export class FlatParking {
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
