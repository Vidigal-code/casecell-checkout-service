import { User as PrismaUser } from '@prisma/client';
import { Role } from '@domain/auth/role.enum';
import { User } from '@domain/auth/user.entity';

export class UserMapper {
  static toDomain(user: PrismaUser): User {
    const role = Role[user.role as keyof typeof Role];
    return User.create(
      {
        email: user.email,
        passwordHash: user.passwordHash,
        role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      user.id,
    );
  }
}
