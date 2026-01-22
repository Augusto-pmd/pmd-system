import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Audit } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Audit)
    private readonly auditRepository: Repository<Audit>,
  ) {}

  async findAll(options: FindManyOptions<Audit> = {}): Promise<[Audit[], number]> {
    return this.auditRepository.findAndCount(options);
  }

  async findByEntity(entity: string, options: FindManyOptions<Audit> = {}): Promise<[Audit[], number]> {
    return this.auditRepository.findAndCount({ ...options, where: { entity } });
  }

  async findByEntityId(entity: string, entityId: string, options: FindManyOptions<Audit> = {}): Promise<[Audit[], number]> {
    return this.auditRepository.findAndCount({ ...options, where: { entity, entityId } });
  }

  async findByUser(userId: string, options: FindManyOptions<Audit> = {}): Promise<[Audit[], number]> {
    return this.auditRepository.findAndCount({ ...options, where: { user: { id: userId } } });
  }

  async log(entity: string, entityId: string, action: string, userId: string, oldValues: any, newValues: any): Promise<void> {
    const auditLog = this.auditRepository.create({
      entity,
      entityId,
      action,
      oldValues,
      newValues,
      user: { id: userId },
    });
    await this.auditRepository.save(auditLog);
  }
}
