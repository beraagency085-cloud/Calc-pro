export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'BDT' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstUSD: number; // For indicative relative conversions
  position: 'prefix' | 'suffix';
}

export type CalculatorCategory = 'all' | 'financial' | 'health' | 'math';

export interface CalculatorMeta {
  id: string;
  title: string;
  shortDesc: string;
  category: 'financial' | 'health' | 'math';
  badge?: string;
  iconName: string;
  accentColor: string; // tailwind color token
  bgLight: string;
  textDark: string;
}

export interface CalculationHistoryItem {
  id: string;
  calculatorId: string;
  calculatorTitle: string;
  summary: string;
  timestamp: number;
  details: Record<string, string | number>;
  inputs?: Record<string, any>;
}
