import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { inline } from '@shared/i18n/bilingual';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductParamsDto {
  @ApiProperty({
    description: inline({
      pt: 'Identificador do produto.',
      en: 'Product identifier.',
    }),
    example: 'prod_123',
  })
  @IsString()
  id!: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
