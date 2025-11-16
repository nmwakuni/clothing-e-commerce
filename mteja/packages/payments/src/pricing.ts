export interface PlanFeatures {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  features: {
    profileAudits: number | 'unlimited';
    prospectResearch: number | 'unlimited';
    outreachMessages: number | 'unlimited';
    templates: number | 'unlimited';
    analytics: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    teamSeats: number;
  };
}

export const PLANS: Record<string, PlanFeatures> = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    currency: 'KES',
    features: {
      profileAudits: 'unlimited',
      prospectResearch: 0,
      outreachMessages: 0,
      templates: 5,
      analytics: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      teamSeats: 1,
    },
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 2900, // ~$29 USD
    yearlyPrice: 29000, // ~$290 USD (2 months free)
    currency: 'KES',
    features: {
      profileAudits: 'unlimited',
      prospectResearch: 50,
      outreachMessages: 150,
      templates: 'unlimited',
      analytics: true,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
      teamSeats: 1,
    },
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 7900, // ~$79 USD
    yearlyPrice: 79000, // ~$790 USD (2 months free)
    currency: 'KES',
    features: {
      profileAudits: 'unlimited',
      prospectResearch: 200,
      outreachMessages: 600,
      templates: 'unlimited',
      analytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: false,
      teamSeats: 3,
    },
  },
  agency: {
    name: 'Agency',
    monthlyPrice: 19900, // ~$199 USD
    yearlyPrice: 199000, // ~$1990 USD (2 months free)
    currency: 'KES',
    features: {
      profileAudits: 'unlimited',
      prospectResearch: 'unlimited',
      outreachMessages: 'unlimited',
      templates: 'unlimited',
      analytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true,
      teamSeats: 10,
    },
  },
};

// Multi-currency pricing (approximate conversions)
export const CURRENCY_RATES: Record<string, number> = {
  KES: 1, // Base currency
  UGX: 36.5, // 1 KES = ~36.5 UGX
  TZS: 3.3, // 1 KES = ~3.3 TZS
  NGN: 12, // 1 KES = ~12 NGN
  GHS: 0.12, // 1 KES = ~0.12 GHS
  USD: 0.0077, // 1 KES = ~$0.0077 USD
};

export function convertPrice(amountInKES: number, targetCurrency: string): number {
  const rate = CURRENCY_RATES[targetCurrency] || 1;
  return Math.ceil(amountInKES * rate);
}

export function getPlanPricing(plan: string, currency: string, period: 'monthly' | 'yearly') {
  const planData = PLANS[plan];
  if (!planData) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const basePrice = period === 'monthly' ? planData.monthlyPrice : planData.yearlyPrice;
  const convertedPrice = convertPrice(basePrice, currency);

  return {
    amount: convertedPrice,
    currency,
    period,
    plan: planData.name,
    features: planData.features,
  };
}
