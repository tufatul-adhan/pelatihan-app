export const toPriceNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    let raw = value.trim();
    if (!raw) return 0;

    raw = raw.replace(/[^\d.,-]/g, '');
    if (!raw) return 0;

    const dotCount = (raw.match(/\./g) || []).length;
    const commaCount = (raw.match(/,/g) || []).length;

    if (dotCount > 0 && commaCount > 0) {
      // Assume locale "1.500.000,50" -> "1500000.50"
      raw = raw.replace(/\./g, '').replace(',', '.');
    } else if (commaCount > 0) {
      // If single comma with <=2 trailing digits, treat as decimal separator.
      raw = /,\d{1,2}$/.test(raw) ? raw.replace(',', '.') : raw.replace(/,/g, '');
    } else if (dotCount > 1) {
      // Multiple dots are likely thousand separators.
      raw = raw.replace(/\./g, '');
    } else if (dotCount === 1 && !/\.\d{1,2}$/.test(raw)) {
      // Single dot with long trailing digits likely thousand separator.
      raw = raw.replace('.', '');
    }

    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed)) return 0;
    return Math.round(parsed);
  }

  return 0;
};

export const formatRupiah = (
  value: unknown,
  options?: { withPrefix?: boolean; emptyLabel?: string }
): string => {
  const amount = toPriceNumber(value);
  if (!amount) return options?.emptyLabel ?? 'Hubungi kami';

  const formatted = amount.toLocaleString('id-ID');
  return options?.withPrefix === false ? formatted : `Rp ${formatted}`;
};
