import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetOrderStatusQuery } from '@application/orders/get-order-status.query';
import { Role } from '@domain/auth/role.enum';
import {
  SWAGGER_OPERATIONS,
  SWAGGER_RESPONSES,
  SWAGGER_TAGS,
} from '@presentation/http/docs/swagger.i18n';
import { inline, multiline } from '@shared/i18n/bilingual';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt.strategy';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags(inline(SWAGGER_TAGS.orders))
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly getOrderStatusQuery: GetOrderStatusQuery) {}

  @Get(':id')
  @Roles(Role.ADMIN, Role.CUSTOMER)
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.orders.getStatus.summary),
    description: multiline(SWAGGER_OPERATIONS.orders.getStatus.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.orders.getStatus.ok) })
  findOne(@Param('id') id: string, @CurrentUser() _user: JwtPayload) {
    return this.getOrderStatusQuery.execute(id);
  }
}
