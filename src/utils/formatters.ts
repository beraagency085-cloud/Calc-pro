import { CurrencyCode, CurrencyConfig } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'INR (Indian Rupee)', rateAgainstUSD: 83.5, position: 'prefix' },
  USD: { code: 'USD', symbol: '$', name: 'USD (US Dollar)', rateAgainstUSD: 1.0, position: 'prefix' },
  EUR: { code: 'EUR', symbol: '€', name: 'EUR (Euro)', rateAgainstUSD: 0.92, position: 'prefix' },
  GBP: { code: 'GBP', symbol: '£', name: 'GBP (British Pound)', rateAgainstUSD: 0.79, position: 'prefix' },
  BDT: { code: 'BDT', symbol: '৳', name: 'BDT (Bangladeshi Taka)', rateAgainstUSD: 117.0, position: 'prefix' },
  AED: { code: 'AED', symbol: 'د.إ', name: 'AED (UAE Dirham)', rateAgainstUSD: 3.67, position: 'prefix' },
};

/**
 * Format numbers with comma grouping based on currency locale
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'INR', maximumFractionDigits = 0): string {
  if (isNaN(amount) || !isFinite(amount)) return `${CURRENCIES[currency].symbol} 0`;

  const symbol = CURRENCIES[currency].symbol;

  let formattedNumber = '';
  if (currency === 'INR' || currency === 'BDT') {
    // South Asian numbering format: 1,00,000
    const parts = amount.toFixed(maximumFractionDigits).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] ? `.${parts[1]}` : '';

    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== '') {
      formattedNumber = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree + decimalPart;
    } else {
      formattedNumber = lastThree + decimalPart;
    }
  } else {
    // International standard format: 1,000,000
    formattedNumber = new Intl.NumberFormat('en-US', {
      maximumFractionDigits,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return `${symbol} ${formattedNumber}`;
}

export function formatNumber(value: number, decimals = 0): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function parseCleanNumber(value: string | number, fallback = 0): number {
  if (typeof value === 'number') return isNaN(value) ? fallback : value;
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}
