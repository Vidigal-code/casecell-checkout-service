import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ListOrdersInput } from '@application/orders/list-orders.query';
import { OrderStatus } from '@domain/order/order-status.enum';
import { inline } from '@shared/i18n/bilingual';

export class AdminListOrdersQueryDto implements ListOrdersInput {
  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: inline({
      pt: 'Página atual da listagem administrativa (inicia em 1).',
      en: 'Current page for the administrative listing (starts at 1).',
    }),
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
    maximum: 50,
    description: inline({
      pt: 'Quantidade de pedidos por página (1 a 50).',
      en: 'Number of orders per page (1 to 50).',
    }),
  })
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  pageSize = 10;

  @ApiPropertyOptional({
    enum: OrderStatus,
    description: inline({
      pt: 'Filtrar pedidos por status atual.',
      en: 'Filter orders by current status.',
    }),
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: inline({
      pt: 'Filtrar pedidos por cliente (UUID).',
      en: 'Filter orders by customer (UUID).',
    }),
    example: 'd7f3ea72-35e4-4b07-8a4a-6f873ad514d0',
  })
  @IsString()
  @IsOptional()
  customerId?: string;
}
