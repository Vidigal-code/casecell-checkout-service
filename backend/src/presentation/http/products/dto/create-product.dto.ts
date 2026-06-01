import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { inline } from '@shared/i18n/bilingual';

export class CreateProductDto {
  @ApiProperty({
    description: inline({
      pt: 'Nome comercial exibido na vitrine.',
      en: 'Commercial name displayed in the showcase.',
    }),
    example: 'Capinha Ultra Proteção iPhone 15',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: inline({
      pt: 'Descrição detalhada apresentada ao cliente.',
      en: 'Detailed description presented to the customer.',
    }),
    example: 'Proteção resistente com bordas elevadas e interior em microfibra.',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: inline({
      pt: 'SKU único utilizado para controle de estoque.',
      en: 'Unique SKU used for inventory control.',
    }),
    example: 'CASE-IPH15-ULTRA',
  })
  @IsString()
  sku!: string;

  @ApiProperty({
    description: inline({
      pt: 'Preço em centavos (inteiro).',
      en: 'Price in cents (integer).',
    }),
    example: 14990,
  })
  @IsInt()
  @Min(0)
  priceCents!: number;

  @ApiProperty({
    description: inline({
      pt: 'Quantidade disponível em estoque.',
      en: 'Available inventory quantity.',
    }),
    example: 20,
  })
  @IsInt()
  @Min(0)
  stock!: number;

  @ApiProperty({
    description: inline({
      pt: 'URL da imagem principal do produto.',
      en: 'Primary image URL for the product.',
    }),
    example: 'https://images.placeholders.dev/?text=Capinha',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: inline({
      pt: 'Define se o produto aparece na vitrine.',
      en: 'Defines whether the product appears in the showcase.',
    }),
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
