import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { inline } from '@shared/i18n/bilingual';

export class LogoutDto {
  @ApiProperty({
    description: inline({
      pt: 'Refresh token ativo retornado no login ou refresh.',
      en: 'Active refresh token provided by login or refresh.',
    }),
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  refreshToken!: string;
}
