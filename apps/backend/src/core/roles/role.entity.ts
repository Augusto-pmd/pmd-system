import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../core/users/user.entity';
import { UserRole } from '../../shared/enums/user-role.enum';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserRole, unique: true })
  name: UserRole;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  permissions: any;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
