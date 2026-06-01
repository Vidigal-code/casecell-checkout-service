import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthenticateUserCommand } from '@application/auth/authenticate-user.command';
import { LogoutUserCommand } from '@application/auth/logout-user.command';
import { RefreshTokenCommand } from '@application/auth/refresh-token.command';
import { RegisterUserCommand } from '@application/auth/register-user.command';
import { Argon2PasswordHasher } from '@infrastructure/auth/argon2-password-hasher.service';
import { JwtTokenService } from '@infrastructure/auth/jwt-token.service';
import { PrismaUserRepository } from '@infrastructure/auth/prisma-user.repository';
import { RedisTokenRevocationStore } from '@infrastructure/redis/redis-token-revocation.store';
import { TOKENS } from '@shared/tokens';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_TOKEN_EXPIRES_IN', '900s') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthenticateUserCommand,
    RegisterUserCommand,
    LogoutUserCommand,
    RefreshTokenCommand,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: TOKENS.USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: TOKENS.PASSWORD_HASHER,
      useClass: Argon2PasswordHasher,
    },
    {
      provide: TOKENS.TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    {
      provide: TOKENS.TOKEN_REVOCATION_STORE,
      useExisting: RedisTokenRevocationStore,
    },
  ],
  exports: [
    JwtModule,
    PassportModule,
    TOKENS.USER_REPOSITORY,
    TOKENS.PASSWORD_HASHER,
    TOKENS.TOKEN_SERVICE,
    TOKENS.TOKEN_REVOCATION_STORE,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
