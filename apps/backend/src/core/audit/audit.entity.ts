import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../core/users/user.entity';

@Entity('audit_logs')
export class Audit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entity: string;

  @Column()
  entityId: string;

  @Column()
  action: string;

  @Column('jsonb', { nullable: true })
  oldValues: any;

  @Column('jsonb', { nullable: true })
  newValues: any;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  timestamp: Date;
}
