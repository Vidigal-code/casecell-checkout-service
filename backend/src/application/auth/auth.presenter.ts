import { User } from '@domain/auth/user.entity';
import { TokenPair } from '../ports/token-service';
import { AuthenticatedUserDto } from './authenticate-user.command';

export function toAuthenticatedUserDto(user: User, tokens: TokenPair): AuthenticatedUserDto {
  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}
