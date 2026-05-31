import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticateUserCommand } from '@application/auth/authenticate-user.command';
import { RefreshTokenCommand } from '@application/auth/refresh-token.command';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { inline, multiline } from '@shared/i18n/bilingual';
import { SWAGGER_OPERATIONS, SWAGGER_RESPONSES, SWAGGER_TAGS } from '@presentation/http/docs/swagger.i18n';

@ApiTags(inline(SWAGGER_TAGS.auth))
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticateUser: AuthenticateUserCommand,
    private readonly refreshTokenCommand: RefreshTokenCommand,
  ) {}

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
}
