import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { PASSWORD_MIN_LENGTH, PASSWORD_REGEX } from '@application/auth/password.policy';
import { inline } from '@shared/i18n/bilingual';

export class RegisterDto {
  @ApiProperty({
    description: inline({
      pt: 'E-mail único utilizado para autenticação.',
      en: 'Unique e-mail used for authentication.',
    }),
    example: 'cliente@casecell.shop',
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
  @MinLength(PASSWORD_MIN_LENGTH)
  @Matches(PASSWORD_REGEX, {
    message: inline({
      pt: 'A senha deve conter letras maiúsculas, minúsculas, números e caractere especial.',
      en: 'Password must include uppercase, lowercase, numbers and a special character.',
    }),
  })
  password!: string;
}
