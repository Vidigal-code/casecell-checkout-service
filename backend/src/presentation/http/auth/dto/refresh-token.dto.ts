import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';
import { inline } from '@shared/i18n/bilingual';

export class RefreshTokenDto {
  @ApiProperty({
    description: inline({
      pt: 'Refresh token previamente emitido.',
      en: 'Previously issued refresh token.',
    }),
  })
  @IsString()
  @IsJWT()
  refreshToken!: string;
}
