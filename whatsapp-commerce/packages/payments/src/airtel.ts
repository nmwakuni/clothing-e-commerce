/**
 * Airtel Money Integration (East Africa)
 * Supports payment collection and disbursement
 */

export interface AirtelConfig {
  clientId: string;
  clientSecret: string;
  apiKey: string;
  environment: 'sandbox' | 'production';
  country: 'KE' | 'UG' | 'TZ' | 'RW'; // Kenya, Uganda, Tanzania, Rwanda
}

export interface AirtelPaymentRequest {
  phoneNumber: string;
  amount: number;
  reference: string;
  description: string;
}

export interface AirtelPaymentResponse {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
}

export class AirtelMoneyService {
  private config: AirtelConfig;
  private baseUrl: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(config: AirtelConfig) {
    this.config = config;

    const baseUrls = {
      sandbox: 'https://openapiuat.airtel.africa',
      production: 'https://openapi.airtel.africa',
    };

    this.baseUrl = baseUrls[config.environment];
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // Check cached token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const response = await fetch(`${this.baseUrl}/auth/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error(`Airtel Money auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;

    // Token typically expires in 3600 seconds
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);

    return this.accessToken;
  }

  /**
   * Initiate payment collection
   */
  async initiatePayment(request: AirtelPaymentRequest): Promise<AirtelPaymentResponse> {
    const token = await this.getAccessToken();
    const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

    const payload = {
      reference: request.reference,
      subscriber: {
        country: this.config.country,
        currency: this.getCurrency(),
        msisdn: phoneNumber,
      },
      transaction: {
        amount: request.amount,
        country: this.config.country,
        currency: this.getCurrency(),
        id: request.reference,
      },
    };

    const response = await fetch(`${this.baseUrl}/merchant/v1/payments/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Country': this.config.country,
        'X-Currency': this.getCurrency(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Airtel Money payment failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      transactionId: data.data.transaction.id,
      status: data.data.transaction.status === 'TS' ? 'success' : 'pending',
      message: data.data.transaction.message || data.status.message,
    };
  }

  /**
   * Query transaction status
   */
  async queryTransaction(transactionId: string): Promise<any> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/standard/v1/payments/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Country': this.config.country,
          'X-Currency': this.getCurrency(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Airtel Money query failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Disburse funds to customer
   */
  async sendPayout(phoneNumber: string, amount: number, reference: string): Promise<any> {
    const token = await this.getAccessToken();

    const payload = {
      payee: {
        msisdn: this.formatPhoneNumber(phoneNumber),
      },
      reference,
      transaction: {
        amount,
        id: reference,
      },
    };

    const response = await fetch(`${this.baseUrl}/standard/v1/disbursements/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Country': this.config.country,
        'X-Currency': this.getCurrency(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Airtel Money disbursement failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get currency based on country
   */
  private getCurrency(): string {
    const currencies: Record<string, string> = {
      KE: 'KES',
      UG: 'UGX',
      TZ: 'TZS',
      RW: 'RWF',
    };

    return currencies[this.config.country];
  }

  /**
   * Format phone number for Airtel
   */
  private formatPhoneNumber(phone: string): string {
    // Remove spaces, dashes, plus
    let cleaned = phone.replace(/[\s\-\+]/g, '');

    // Country prefixes
    const prefixes: Record<string, string> = {
      KE: '254',
      UG: '256',
      TZ: '255',
      RW: '250',
    };

    const prefix = prefixes[this.config.country];

    // If starts with 0, replace with country code
    if (cleaned.startsWith('0')) {
      cleaned = prefix + cleaned.slice(1);
    }

    // If doesn't start with country code, add it
    if (!cleaned.startsWith(prefix)) {
      cleaned = prefix + cleaned;
    }

    return cleaned;
  }

  /**
   * Validate phone number for country
   */
  validatePhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);

    // Basic validation based on country
    const patterns: Record<string, RegExp> = {
      KE: /^254[17]\d{8}$/,
      UG: /^256[37]\d{8}$/,
      TZ: /^255[67]\d{8}$/,
      RW: /^250[78]\d{8}$/,
    };

    const pattern = patterns[this.config.country];
    return pattern ? pattern.test(formatted) : true;
  }
}
