import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { inline } from '@shared/i18n/bilingual';

export class LoginDto {
  @ApiProperty({
    description: inline({
      pt: 'E-mail do usuário cadastrado.',
      en: 'Registered user e-mail.',
    }),
    example: 'customer@casecell.shop',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: inline({
      pt: 'Senha forte com letras maiúsculas, minúsculas, números e caractere especial.',
      en: 'Strong password containing uppercase, lowercase, numbers and a special character.',
    }),
    example: 'Cliente12345@',
  })
  @IsString()
  @MinLength(10)
  password!: string;
}
