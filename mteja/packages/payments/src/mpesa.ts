import axios from 'axios';

export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  environment: 'sandbox' | 'production';
}

export interface MpesaSTKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
}

export interface MpesaSTKPushResponse {
  merchantRequestID: string;
  checkoutRequestID: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

export interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: any;
        }>;
      };
    };
  };
}

export class MpesaService {
  private config: MpesaConfig;
  private baseUrl: string;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(config: MpesaConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
  }

  private async getAccessToken(): Promise<string> {
    // Check cache
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    const auth = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString('base64');

    const response = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in;

    // Cache token (expires in 1 hour typically, cache for 55 minutes to be safe)
    this.tokenCache = {
      token,
      expiresAt: Date.now() + (expiresIn - 300) * 1000,
    };

    return token;
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Remove leading 0 or +254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      // Already formatted
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.substring(1);
    }

    return cleaned;
  }

  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  private generatePassword(timestamp: string): string {
    const str = `${this.config.businessShortCode}${this.config.passkey}${timestamp}`;
    return Buffer.from(str).toString('base64');
  }

  async initiateSTKPush(request: MpesaSTKPushRequest): Promise<MpesaSTKPushResponse> {
    const token = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);
    const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

    const payload = {
      BusinessShortCode: this.config.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(request.amount),
      PartyA: phoneNumber,
      PartyB: this.config.businessShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: request.callbackUrl,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc,
    };

    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      merchantRequestID: response.data.MerchantRequestID,
      checkoutRequestID: response.data.CheckoutRequestID,
      responseCode: response.data.ResponseCode,
      responseDescription: response.data.ResponseDescription,
      customerMessage: response.data.CustomerMessage,
    };
  }

  async queryTransaction(checkoutRequestID: string): Promise<any> {
    const token = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);

    const payload = {
      BusinessShortCode: this.config.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };

    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  parseCallback(callbackData: MpesaCallbackData): {
    success: boolean;
    mpesaReceiptNumber?: string;
    amount?: number;
    phoneNumber?: string;
    transactionDate?: string;
    errorMessage?: string;
  } {
    const callback = callbackData.Body.stkCallback;

    if (callback.ResultCode !== 0) {
      return {
        success: false,
        errorMessage: callback.ResultDesc,
      };
    }

    const metadata = callback.CallbackMetadata?.Item || [];
    const getMetadataValue = (name: string) => {
      const item = metadata.find((i) => i.Name === name);
      return item?.Value;
    };

    return {
      success: true,
      mpesaReceiptNumber: getMetadataValue('MpesaReceiptNumber'),
      amount: getMetadataValue('Amount'),
      phoneNumber: getMetadataValue('PhoneNumber'),
      transactionDate: getMetadataValue('TransactionDate'),
    };
  }

  validatePhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    // Kenyan Safaricom numbers start with 254 followed by 7XX, 1XX, or 0XX
    return /^254[710]\d{8}$/.test(formatted);
  }
}
