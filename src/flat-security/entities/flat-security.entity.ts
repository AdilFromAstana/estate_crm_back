// src/flat-security/entities/flat-security.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('flat_security')
export class FlatSecurity {
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
