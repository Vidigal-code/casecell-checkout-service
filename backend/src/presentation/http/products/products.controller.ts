import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListProductsQuery } from '@application/products/list-products.query';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { inline, multiline } from '@shared/i18n/bilingual';
import { SWAGGER_OPERATIONS, SWAGGER_RESPONSES, SWAGGER_TAGS } from '@presentation/http/docs/swagger.i18n';

@ApiTags(inline(SWAGGER_TAGS.products))
@Controller('products')
export class ProductsController {
  constructor(private readonly listProductsQuery: ListProductsQuery) {}

  @Get()
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.products.list.summary),
    description: multiline(SWAGGER_OPERATIONS.products.list.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.products.list.ok) })
  list(@Query() query: ListProductsQueryDto) {
    return this.listProductsQuery.execute(query);
  }
}
