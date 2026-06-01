import { Transform } from 'class-transformer';

export const toInt = () =>
  Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  });
