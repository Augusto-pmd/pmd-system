import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...rest } = createUserDto;
    
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.usersRepository.create({ 
      email, 
      password: hashedPassword, 
      ...rest 
    });
    
    return this.usersRepository.save(user);
  }

  async findAll(options: FindManyOptions<User> = {}): Promise<[User[], number]> {
    return this.usersRepository.findAndCount(options);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = Object.assign(user, updateUserDto);
    return this.usersRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async changePassword(id: string, oldPass: string, newPass: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id }, select: ['password'] });

    if (!user) {
        throw new NotFoundException(`User with ID "${id}" not found`);
    }

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
        throw new BadRequestException('Invalid old password');
    }

    const hashedNewPassword = await bcrypt.hash(newPass, 10);
    await this.usersRepository.update(id, { password: hashedNewPassword });
  }
}
