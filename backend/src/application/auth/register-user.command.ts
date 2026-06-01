import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '@shared/tokens';
import { UserRepository } from '@domain/auth/user.repository';
import { PasswordHasher } from '../ports/password-hasher';
import { TokenService } from '../ports/token-service';
import { ValidationError } from '@domain/common/errors';
import { PasswordPolicy } from './password.policy';
import { AuthenticatedUserDto } from './authenticate-user.command';
import { toAuthenticatedUserDto } from './auth.presenter';
import { Role } from '@domain/auth/role.enum';
import { User } from '@domain/auth/user.entity';

export interface RegisterUserInput {
  email: string;
  password: string;
}

@Injectable()
export class RegisterUserCommand {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKENS.TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthenticatedUserDto> {
    const normalizedEmail = input.email?.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new ValidationError('Email is required.');
    }

    PasswordPolicy.ensureStrong(input.password);

    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ValidationError('Email already registered.');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = User.create({
      email: normalizedEmail,
      passwordHash,
      role: Role.CUSTOMER,
      isActive: true,
    });

    await this.userRepository.save(user);

    const tokens = await this.tokenService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return toAuthenticatedUserDto(user, tokens);
  }
}
