import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { inline } from '@shared/i18n/bilingual';

export class ListProductsQueryDto {
  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: inline({
      pt: 'Página atual da listagem (começa em 1).',
      en: 'Current page number (starts at 1).',
    }),
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page = 1;

  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
    maximum: 50,
    description: inline({
      pt: 'Quantidade de itens por página (1 a 50).',
      en: 'Number of items per page (1 to 50).',
    }),
  })
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  @Type(() => Number)
  pageSize = 10;

  @ApiPropertyOptional({
    description: inline({
      pt: 'Filtro textual aplicado em nome, descrição ou SKU.',
      en: 'Text filter applied to name, description, or SKU.',
    }),
    example: 'silicone',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = `${value}`.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  search?: string;
}
