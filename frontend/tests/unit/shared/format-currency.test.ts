import { formatCurrency } from '@/shared/lib/format-currency';

describe('formatCurrency', () => {
  it('formata valores em BRL', () => {
    expect(formatCurrency(19.9)).toBe('R$\u00a019,90');
  });
});
