import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../roles/role.entity';
import { Organization } from '../core/organizations/organization.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column()
  fullName: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ name: 'organizationId', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, organization => organization.users, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
