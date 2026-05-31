import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthenticateUserCommand } from '@application/auth/authenticate-user.command';
import { RefreshTokenCommand } from '@application/auth/refresh-token.command';
import { TOKENS } from '@shared/tokens';
import { PrismaUserRepository } from '@infrastructure/auth/prisma-user.repository';
import { Argon2PasswordHasher } from '@infrastructure/auth/argon2-password-hasher.service';
import { JwtTokenService } from '@infrastructure/auth/jwt-token.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
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
  ],
  exports: [
    JwtModule,
    PassportModule,
    TOKENS.USER_REPOSITORY,
    TOKENS.PASSWORD_HASHER,
    TOKENS.TOKEN_SERVICE,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
