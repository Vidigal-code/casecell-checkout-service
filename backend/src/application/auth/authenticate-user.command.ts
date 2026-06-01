import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/auth/user.repository';
import { UnauthorizedError, ValidationError } from '@domain/common/errors';
import { TOKENS } from '@shared/tokens';
import { toAuthenticatedUserDto } from './auth.presenter';
import { PasswordHasher } from '../ports/password-hasher';
import { TokenPair, TokenService } from '../ports/token-service';

export interface AuthenticateUserInput {
  email: string;
  password: string;
}

export interface AuthenticatedUserDto extends TokenPair {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthenticateUserCommand {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TOKENS.TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: AuthenticateUserInput): Promise<AuthenticatedUserDto> {
    if (!input.email || !input.password) {
      throw new ValidationError('Email and password are required.');
    }

    const normalizedEmail = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials.');
    }

    const matches = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedError('Invalid credentials.');
    }

    const tokens = await this.tokenService.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return toAuthenticatedUserDto(user, tokens);
  }
}
