import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity('complexes')
export class Complex {
  @PrimaryColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  district?: string;

  @Column({ nullable: true })
  developer?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'json', default: {} })
  details: Record<string, any>;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
