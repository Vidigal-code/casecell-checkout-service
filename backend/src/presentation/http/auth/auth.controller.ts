import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticateUserCommand } from '@application/auth/authenticate-user.command';
import { LogoutUserCommand } from '@application/auth/logout-user.command';
import { RefreshTokenCommand } from '@application/auth/refresh-token.command';
import { RegisterUserCommand } from '@application/auth/register-user.command';
import {
  SWAGGER_OPERATIONS,
  SWAGGER_RESPONSES,
  SWAGGER_TAGS,
} from '@presentation/http/docs/swagger.i18n';
import { inline, multiline } from '@shared/i18n/bilingual';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags(inline(SWAGGER_TAGS.auth))
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticateUser: AuthenticateUserCommand,
    private readonly refreshTokenCommand: RefreshTokenCommand,
    private readonly registerUserCommand: RegisterUserCommand,
    private readonly logoutUserCommand: LogoutUserCommand,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.auth.register.summary),
    description: multiline(SWAGGER_OPERATIONS.auth.register.description),
  })
  @ApiCreatedResponse({ description: inline(SWAGGER_RESPONSES.auth.register.ok) })
  register(@Body() body: RegisterDto) {
    return this.registerUserCommand.execute(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.auth.login.summary),
    description: multiline(SWAGGER_OPERATIONS.auth.login.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.auth.login.ok) })
  login(@Body() body: LoginDto) {
    return this.authenticateUser.execute(body);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.auth.refresh.summary),
    description: multiline(SWAGGER_OPERATIONS.auth.refresh.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.auth.refresh.ok) })
  refresh(@Body() body: RefreshTokenDto) {
    return this.refreshTokenCommand.execute(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.auth.logout.summary),
    description: multiline(SWAGGER_OPERATIONS.auth.logout.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.auth.logout.ok) })
  logout(@Body() body: LogoutDto) {
    return this.logoutUserCommand.execute(body);
  }
}
