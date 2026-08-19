import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { CurrencyCode } from '../types';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export { dayjs };

export function formatCurrency(amount: number, currency: CurrencyCode | 'MMK' = 'USD'): string {
  if (currency === 'MMK') {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount) + ' MMK';
  }

  const symbolMap: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    SGD: 'S$',
    THB: '฿',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    MYR: 'RM',
  };

  const symbol = symbolMap[currency as CurrencyCode] || currency + ' ';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol}${formatted}`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(dateString: string, format = 'DD MMM YYYY, hh:mm A'): string {
  return dayjs(dateString).format(format);
}

export function formatDateShort(dateString: string): string {
  return dayjs(dateString).format('DD/MM/YYYY');
}

export function getCurrencyFlag(currency: CurrencyCode): string {
  const flagMap: Record<CurrencyCode, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    SGD: '🇸🇬',
    THB: '🇹🇭',
    GBP: '🇬🇧',
    JPY: '🇯🇵',
    CNY: '🇨🇳',
    MYR: '🇲🇾',
  };
  return flagMap[currency] || '🌐';
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length < 8) return acc;
  const lastFour = acc.slice(-4);
  const prefix = acc.slice(0, 4);
  return `${prefix}-****-****-${lastFour}`;
}
