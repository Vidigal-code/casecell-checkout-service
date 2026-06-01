import { Injectable } from '@nestjs/common';
import { Role as PrismaRole } from '@prisma/client';
import { User } from '@domain/auth/user.entity';
import { UserRepository } from '@domain/auth/user.repository';
import { UserMapper } from './user.mapper';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? UserMapper.toDomain(user) : null;
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role as PrismaRole,
        isActive: user.isActive,
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role as PrismaRole,
        isActive: user.isActive,
      },
    });
  }
}
