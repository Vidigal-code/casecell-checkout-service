import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { inline } from '@shared/i18n/bilingual';

export class LoginDto {
  @ApiProperty({
    description: inline({
      pt: 'E-mail do usuário seed (admin@casecell.shop ou customer@casecell.shop).',
      en: 'Seed user e-mail (admin@casecell.shop or customer@casecell.shop).',
    }),
    example: 'customer@casecell.shop',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: inline({
      pt: 'Senha vinculada ao usuário seed.',
      en: 'Password associated with the seeded user.',
    }),
    example: 'customer123',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
