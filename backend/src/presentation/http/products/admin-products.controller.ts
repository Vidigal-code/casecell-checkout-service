import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProductCommand } from '@application/products/create-product.command';
import { DeleteProductCommand } from '@application/products/delete-product.command';
import { GetProductQuery } from '@application/products/get-product.query';
import { ListAdminProductsQuery } from '@application/products/list-admin-products.query';
import { UpdateProductCommand } from '@application/products/update-product.command';
import { Role } from '@domain/auth/role.enum';
import { JwtAuthGuard } from '@presentation/http/auth/jwt-auth.guard';
import { Roles } from '@presentation/http/auth/roles.decorator';
import { RolesGuard } from '@presentation/http/auth/roles.guard';
import {
  SWAGGER_OPERATIONS,
  SWAGGER_RESPONSES,
  SWAGGER_TAGS,
} from '@presentation/http/docs/swagger.i18n';
import { inline, multiline } from '@shared/i18n/bilingual';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { UpdateProductDto, UpdateProductParamsDto } from './dto/update-product.dto';

@ApiTags(inline(SWAGGER_TAGS.adminProducts))
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/products')
export class AdminProductsController {
  constructor(
    private readonly createProduct: CreateProductCommand,
    private readonly updateProduct: UpdateProductCommand,
    private readonly deleteProduct: DeleteProductCommand,
    private readonly getProduct: GetProductQuery,
    private readonly listProducts: ListAdminProductsQuery,
  ) {}

  @Get()
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.adminProducts.list.summary),
    description: multiline(SWAGGER_OPERATIONS.adminProducts.list.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.adminProducts.list.ok) })
  list(@Query() query: ListProductsQueryDto) {
    return this.listProducts.execute(query);
  }

  @Post()
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.adminProducts.create.summary),
    description: multiline(SWAGGER_OPERATIONS.adminProducts.create.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.adminProducts.create.ok) })
  create(@Body() body: CreateProductDto) {
    return this.createProduct.execute(body);
  }

  @Get(':id')
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.adminProducts.get.summary),
    description: multiline(SWAGGER_OPERATIONS.adminProducts.get.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.adminProducts.get.ok) })
  findOne(@Param() params: UpdateProductParamsDto) {
    return this.getProduct.execute(params.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.adminProducts.update.summary),
    description: multiline(SWAGGER_OPERATIONS.adminProducts.update.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.adminProducts.update.ok) })
  update(@Param() params: UpdateProductParamsDto, @Body() body: UpdateProductDto) {
    return this.updateProduct.execute({ id: params.id, ...body });
  }

  @Delete(':id')
  @ApiOperation({
    summary: inline(SWAGGER_OPERATIONS.adminProducts.remove.summary),
    description: multiline(SWAGGER_OPERATIONS.adminProducts.remove.description),
  })
  @ApiOkResponse({ description: inline(SWAGGER_RESPONSES.adminProducts.remove.ok) })
  remove(@Param() params: UpdateProductParamsDto) {
    return this.deleteProduct.execute(params.id);
  }
}
