/**
 * Multi-Currency Support for Pan-African Expansion
 * Supports KES, UGX, TZS, RWF, NGN, GHS with real-time conversion
 */

export type SupportedCurrency = 'KES' | 'UGX' | 'TZS' | 'RWF' | 'NGN' | 'GHS';

export interface CurrencyConfig {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  country: string;
  decimalPlaces: number;
  exchangeRateToUSD: number; // Base rate
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KES',
    country: 'Kenya',
    decimalPlaces: 2,
    exchangeRateToUSD: 0.0078, // 1 KES = $0.0078
  },
  UGX: {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'UGX',
    country: 'Uganda',
    decimalPlaces: 0,
    exchangeRateToUSD: 0.00027, // 1 UGX = $0.00027
  },
  TZS: {
    code: 'TZS',
    name: 'Tanzanian Shilling',
    symbol: 'TZS',
    country: 'Tanzania',
    decimalPlaces: 2,
    exchangeRateToUSD: 0.00040, // 1 TZS = $0.00040
  },
  RWF: {
    code: 'RWF',
    name: 'Rwandan Franc',
    symbol: 'RWF',
    country: 'Rwanda',
    decimalPlaces: 0,
    exchangeRateToUSD: 0.00078, // 1 RWF = $0.00078
  },
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    country: 'Nigeria',
    decimalPlaces: 2,
    exchangeRateToUSD: 0.0013, // 1 NGN = $0.0013
  },
  GHS: {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    country: 'Ghana',
    decimalPlaces: 2,
    exchangeRateToUSD: 0.084, // 1 GHS = $0.084
  },
};

export class MultiCurrencyService {
  /**
   * Convert amount between currencies
   */
  convert(
    amount: number,
    fromCurrency: SupportedCurrency,
    toCurrency: SupportedCurrency
  ): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const fromConfig = CURRENCIES[fromCurrency];
    const toConfig = CURRENCIES[toCurrency];

    // Convert to USD as intermediate
    const usdAmount = amount * fromConfig.exchangeRateToUSD;

    // Convert from USD to target currency
    const convertedAmount = usdAmount / toConfig.exchangeRateToUSD;

    // Round to appropriate decimal places
    return this.roundToCurrency(convertedAmount, toCurrency);
  }

  /**
   * Format amount in currency
   */
  format(amount: number, currency: SupportedCurrency): string {
    const config = CURRENCIES[currency];
    const rounded = this.roundToCurrency(amount, currency);

    return `${config.symbol} ${rounded.toLocaleString('en-US', {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    })}`;
  }

  /**
   * Round to currency's decimal places
   */
  roundToCurrency(amount: number, currency: SupportedCurrency): number {
    const config = CURRENCIES[currency];
    const multiplier = Math.pow(10, config.decimalPlaces);
    return Math.round(amount * multiplier) / multiplier;
  }

  /**
   * Get currency from country code
   */
  getCurrencyFromCountry(countryCode: string): SupportedCurrency {
    const countryToCurrency: Record<string, SupportedCurrency> = {
      KE: 'KES',
      UG: 'UGX',
      TZ: 'TZS',
      RW: 'RWF',
      NG: 'NGN',
      GH: 'GHS',
    };

    return countryToCurrency[countryCode] || 'KES';
  }

  /**
   * Get currency from phone number
   */
  getCurrencyFromPhone(phoneNumber: string): SupportedCurrency {
    const cleaned = phoneNumber.replace(/[\s\-\+]/g, '');

    // Country prefixes
    if (cleaned.startsWith('254')) return 'KES'; // Kenya
    if (cleaned.startsWith('256')) return 'UGX'; // Uganda
    if (cleaned.startsWith('255')) return 'TZS'; // Tanzania
    if (cleaned.startsWith('250')) return 'RWF'; // Rwanda
    if (cleaned.startsWith('234')) return 'NGN'; // Nigeria
    if (cleaned.startsWith('233')) return 'GHS'; // Ghana

    return 'KES'; // Default
  }

  /**
   * Fetch live exchange rates (optional enhancement)
   */
  async fetchLiveRates(): Promise<Record<SupportedCurrency, number>> {
    // In production, use API like exchangerate-api.com or openexchangerates.org
    // For now, return static rates
    return {
      KES: 128.5,
      UGX: 3700,
      TZS: 2500,
      RWF: 1280,
      NGN: 770,
      GHS: 12,
    };
  }

  /**
   * Get all supported currencies
   */
  getAllCurrencies(): CurrencyConfig[] {
    return Object.values(CURRENCIES);
  }

  /**
   * Validate amount for currency
   */
  validateAmount(amount: number, currency: SupportedCurrency): boolean {
    if (amount <= 0) return false;

    const config = CURRENCIES[currency];

    // Check if amount respects decimal places
    const multiplier = Math.pow(10, config.decimalPlaces);
    const rounded = Math.round(amount * multiplier) / multiplier;

    return amount === rounded;
  }
}
