import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListOrdersQuery } from '@application/orders/list-orders.query';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@domain/auth/role.enum';
import { AdminListOrdersQueryDto } from './dto/admin-list-orders-query.dto';
import { inline, multiline } from '@shared/i18n/bilingual';
import { SWAGGER_OPERATIONS, SWAGGER_RESPONSES, SWAGGER_TAGS } from '@presentation/http/docs/swagger.i18n';

@ApiTags(inline(SWAGGER_TAGS.adminOrders))
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly listOrdersQuery: ListOrdersQuery) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.adminOrders.list.summary),
    description: multiline(SWAGGER_OPERATIONS.adminOrders.list.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.adminOrders.list.ok) })
  list(@Query() query: AdminListOrdersQueryDto) {
    return this.listOrdersQuery.execute(query);
  }
}
