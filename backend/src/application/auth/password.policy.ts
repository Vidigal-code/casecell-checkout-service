import { ValidationError } from '@domain/common/errors';
import { inline } from '@shared/i18n/bilingual';

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/;

export class PasswordPolicy {
  static ensureStrong(password: string): void {
    if (!password || password.length < PASSWORD_MIN_LENGTH || !PASSWORD_REGEX.test(password)) {
      throw new ValidationError(
        inline({
          pt: 'A senha deve conter letras maiúsculas, minúsculas, números e caractere especial.',
          en: 'Password must include uppercase, lowercase, numbers and a special character.',
        }),
      );
    }
  }
}
