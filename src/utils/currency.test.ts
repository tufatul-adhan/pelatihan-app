import { formatRupiah, toPriceNumber } from './currency';

describe('currency utils', () => {
  it('normalizes common rupiah input formats', () => {
    expect(toPriceNumber('Rp 1.500.000')).toBe(1500000);
    expect(toPriceNumber('1.500.000,50')).toBe(1500001);
    expect(toPriceNumber('')).toBe(0);
  });

  it('formats rupiah values with a sensible empty label', () => {
    expect(formatRupiah(250000)).toBe('Rp 250.000');
    expect(formatRupiah(0)).toBe('Hubungi kami');
    expect(formatRupiah(250000, { withPrefix: false })).toBe('250.000');
  });
});
