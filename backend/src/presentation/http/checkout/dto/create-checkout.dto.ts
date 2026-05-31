import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString } from 'class-validator';
import { inline } from '@shared/i18n/bilingual';

export class CreateCheckoutDto {
  @ApiProperty({
    description: inline({
      pt: 'Identificador do produto selecionado (UUID).',
      en: 'Identifier of the selected product (UUID).',
    }),
    example: 'a3f79b23-96f0-4f2f-9a85-2f45f5183df3',
  })
  @IsString()
  productId!: string;

  @ApiProperty({
    minimum: 1,
    default: 1,
    description: inline({
      pt: 'Quantidade desejada para o produto informado.',
      en: 'Desired quantity for the selected product.',
    }),
  })
  @IsInt()
  @IsPositive()
  quantity!: number;
}
