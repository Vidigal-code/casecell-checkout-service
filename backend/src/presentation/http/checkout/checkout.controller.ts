import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  CreateCheckoutCommand,
  CheckoutResponseStatus,
  CheckoutResponseDto,
} from '@application/checkout/create-checkout.command';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@domain/auth/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/jwt.strategy';
import { inline, multiline, asMessagePayload } from '@shared/i18n/bilingual';
import { SWAGGER_HEADERS, SWAGGER_OPERATIONS, SWAGGER_RESPONSES, SWAGGER_TAGS } from '@presentation/http/docs/swagger.i18n';
import { CHECKOUT_MESSAGES } from '@application/checkout/checkout.messages';

@ApiTags(inline(SWAGGER_TAGS.checkout))
@ApiBearerAuth()
@Controller('checkout')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckoutController {
  private readonly statusCodeByResponse: Record<CheckoutResponseStatus, HttpStatus> = {
    [CheckoutResponseStatus.SUCCESS]: HttpStatus.CREATED,
    [CheckoutResponseStatus.INSUFFICIENT_STOCK]: HttpStatus.CONFLICT,
    [CheckoutResponseStatus.DUPLICATE]: HttpStatus.OK,
    [CheckoutResponseStatus.TECHNICAL_FAILURE]: HttpStatus.SERVICE_UNAVAILABLE,
    [CheckoutResponseStatus.VALIDATION_ERROR]: HttpStatus.UNPROCESSABLE_ENTITY,
  };

  constructor(private readonly createCheckoutCommand: CreateCheckoutCommand) {}

  @Post()
  @Roles(Role.CUSTOMER)
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.checkout.create.summary),
    description: multiline(SWAGGER_OPERATIONS.checkout.create.description),
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: inline(SWAGGER_HEADERS.idempotencyKey),
    required: true,
  })
  @ApiCreatedResponse({ description: inline(SWAGGER_RESPONSES.checkout.create.ok) })
  @ApiConflictResponse({ description: inline(SWAGGER_RESPONSES.checkout.create.conflict!) })
  @ApiTooManyRequestsResponse({ description: inline(SWAGGER_RESPONSES.checkout.create.throttled!) })
  @ApiBadRequestResponse({ description: inline(CHECKOUT_MESSAGES.idempotencyKeyRequired) })
  @ApiUnprocessableEntityResponse({ description: inline(SWAGGER_RESPONSES.checkout.create.validation!) })
  @ApiServiceUnavailableResponse({ description: inline(SWAGGER_RESPONSES.checkout.create.unavailable!) })
  async create(
    @Body() body: CreateCheckoutDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const resolvedIdempotencyKey = this.ensureIdempotencyKey(idempotencyKey);

    const response = await this.createCheckoutCommand.execute({
      customerId: user.sub,
      productId: body.productId,
      quantity: body.quantity,
      idempotencyKey: resolvedIdempotencyKey,
    });

    return this.dispatchCheckoutResponse(response);
  }

  private ensureIdempotencyKey(key?: string): string {
    if (!key) {
      this.raise(HttpStatus.BAD_REQUEST, asMessagePayload(CHECKOUT_MESSAGES.idempotencyKeyRequired));
    }
    return key as string;
  }

  private dispatchCheckoutResponse(response: CheckoutResponseDto): CheckoutResponseDto {
    if (response.duplicate) {
      this.raise(HttpStatus.OK, response);
    }

    const httpStatus = this.statusCodeByResponse[response.status];
    if (httpStatus === HttpStatus.CREATED) {
      return response;
    }

    if (httpStatus) {
      this.raise(httpStatus, response);
    }

    this.raise(HttpStatus.INTERNAL_SERVER_ERROR, asMessagePayload(CHECKOUT_MESSAGES.unexpectedError));
  }

  private raise(status: HttpStatus, payload: CheckoutResponseDto | Record<string, unknown> | string): never {
    throw new HttpException(payload, status);
  }
}
