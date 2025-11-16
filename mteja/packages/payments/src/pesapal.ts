import axios from 'axios';
import crypto from 'crypto';

export interface PesapalConfig {
  consumerKey: string;
  consumerSecret: string;
  environment: 'sandbox' | 'production';
}

export interface PesapalPaymentRequest {
  amount: number;
  currency: string; // KES, UGX, TZS, etc.
  description: string;
  callbackUrl: string;
  notificationId: string; // IPN registration ID
  billingAddress: {
    email: string;
    phone: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface PesapalPaymentResponse {
  orderTrackingId: string;
  merchantReference: string;
  redirectUrl: string;
  error?: string;
  status: number;
}

export interface PesapalTransactionStatus {
  paymentMethod: string;
  amount: number;
  createdDate: string;
  confirmationCode: string;
  paymentStatusDescription: string;
  description: string;
  message: string;
  paymentAccount: string;
  callBackUrl: string;
  statusCode: number;
  merchantReference: string;
  paymentStatusCode: string;
  currency: string;
}

export class PesapalService {
  private config: PesapalConfig;
  private baseUrl: string;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(config: PesapalConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === 'production'
        ? 'https://pay.pesapal.com/v3'
        : 'https://cybqa.pesapal.com/pesapalv3';
  }

  private async getAccessToken(): Promise<string> {
    // Check cache
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    const response = await axios.post(
      `${this.baseUrl}/api/Auth/RequestToken`,
      {
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    const token = response.data.token;
    const expiresIn = response.data.expiryDate;

    // Cache token
    this.tokenCache = {
      token,
      expiresAt: new Date(expiresIn).getTime() - 60000, // Expire 1 min before actual expiry
    };

    return token;
  }

  async registerIPN(url: string, ipnType: 'GET' | 'POST' = 'POST'): Promise<string> {
    const token = await this.getAccessToken();

    const response = await axios.post(
      `${this.baseUrl}/api/URLSetup/RegisterIPN`,
      {
        url,
        ipn_notification_type: ipnType,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return response.data.ipn_id;
  }

  async submitOrder(request: PesapalPaymentRequest): Promise<PesapalPaymentResponse> {
    const token = await this.getAccessToken();

    // Generate unique merchant reference
    const merchantReference = `MTEJA-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    const payload = {
      id: merchantReference,
      currency: request.currency,
      amount: request.amount,
      description: request.description,
      callback_url: request.callbackUrl,
      notification_id: request.notificationId,
      billing_address: {
        email_address: request.billingAddress.email,
        phone_number: request.billingAddress.phone,
        first_name: request.billingAddress.firstName || '',
        last_name: request.billingAddress.lastName || '',
        country_code: this.getCountryCode(request.currency),
      },
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/Transactions/SubmitOrderRequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      return {
        orderTrackingId: response.data.order_tracking_id,
        merchantReference: response.data.merchant_reference,
        redirectUrl: response.data.redirect_url,
        status: response.data.status,
      };
    } catch (error: any) {
      return {
        orderTrackingId: '',
        merchantReference,
        redirectUrl: '',
        error: error.response?.data?.error || error.message,
        status: error.response?.status || 500,
      };
    }
  }

  async getTransactionStatus(orderTrackingId: string): Promise<PesapalTransactionStatus> {
    const token = await this.getAccessToken();

    const response = await axios.get(
      `${this.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    );

    return response.data;
  }

  private getCountryCode(currency: string): string {
    const currencyMap: Record<string, string> = {
      KES: 'KE', // Kenya
      UGX: 'UG', // Uganda
      TZS: 'TZ', // Tanzania
      RWF: 'RW', // Rwanda
      NGN: 'NG', // Nigeria
      GHS: 'GH', // Ghana
      ZAR: 'ZA', // South Africa
      USD: 'US',
    };

    return currencyMap[currency] || 'KE';
  }

  parseIPN(ipnData: any): {
    orderTrackingId: string;
    merchantReference: string;
    status: string;
  } {
    return {
      orderTrackingId: ipnData.OrderTrackingId,
      merchantReference: ipnData.OrderMerchantReference,
      status: ipnData.Status,
    };
  }

  isPaymentSuccessful(status: PesapalTransactionStatus): boolean {
    // Status codes: 0 = Invalid, 1 = Completed, 2 = Failed, 3 = Reversed
    return status.statusCode === 1 || status.paymentStatusCode === '1';
  }
}
