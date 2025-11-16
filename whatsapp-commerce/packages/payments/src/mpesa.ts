/**
 * M-Pesa Integration for Kenya (Safaricom)
 * Supports STK Push (Lipa Na M-Pesa Online) and B2C Payouts
 */

export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  environment: 'sandbox' | 'production';
}

export interface MpesaPaymentRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface MpesaPaymentResponse {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

export interface MpesaCallbackData {
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
}

export class MpesaService {
  private config: MpesaConfig;
  private baseUrl: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(config: MpesaConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const auth = btoa(`${this.config.consumerKey}:${this.config.consumerSecret}`);

    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get M-Pesa access token: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;

    // Token expires in 3600 seconds, we'll refresh 5 minutes before
    this.tokenExpiry = new Date(Date.now() + (3600 - 300) * 1000);

    return this.accessToken;
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   */
  async initiatePayment(request: MpesaPaymentRequest): Promise<MpesaPaymentResponse> {
    const token = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);

    // Format phone number (remove +254 or 0, add 254)
    const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

    const payload = {
      BusinessShortCode: this.config.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(request.amount), // M-Pesa requires integer
      PartyA: phoneNumber,
      PartyB: this.config.businessShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.API_URL}/api/payments/mpesa/callback`,
      AccountReference: request.accountReference,
      TransactionDesc: request.transactionDesc,
    };

    const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`M-Pesa STK Push failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      merchantRequestId: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
      responseCode: data.ResponseCode,
      responseDescription: data.ResponseDescription,
      customerMessage: data.CustomerMessage,
    };
  }

  /**
   * Query STK Push status
   */
  async queryPaymentStatus(checkoutRequestId: string): Promise<any> {
    const token = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);

    const payload = {
      BusinessShortCode: this.config.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`M-Pesa query failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Process M-Pesa callback
   */
  parseCallback(callbackData: any): MpesaCallbackData {
    const body = callbackData.Body.stkCallback;

    const result: MpesaCallbackData = {
      merchantRequestId: body.MerchantRequestID,
      checkoutRequestId: body.CheckoutRequestID,
      resultCode: body.ResultCode,
      resultDesc: body.ResultDesc,
    };

    // If successful, extract metadata
    if (body.ResultCode === 0 && body.CallbackMetadata) {
      const metadata = body.CallbackMetadata.Item;

      for (const item of metadata) {
        switch (item.Name) {
          case 'MpesaReceiptNumber':
            result.mpesaReceiptNumber = item.Value;
            break;
          case 'TransactionDate':
            result.transactionDate = item.Value;
            break;
          case 'PhoneNumber':
            result.phoneNumber = item.Value;
            break;
        }
      }
    }

    return result;
  }

  /**
   * B2C Payout (Send money to customer)
   */
  async sendPayout(phoneNumber: string, amount: number, remarks: string): Promise<any> {
    const token = await this.getAccessToken();

    const payload = {
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID: 'BusinessPayment',
      Amount: Math.round(amount),
      PartyA: this.config.businessShortCode,
      PartyB: this.formatPhoneNumber(phoneNumber),
      Remarks: remarks,
      QueueTimeOutURL: `${process.env.API_URL}/api/payments/mpesa/timeout`,
      ResultURL: `${process.env.API_URL}/api/payments/mpesa/result`,
      Occassion: '',
    };

    const response = await fetch(`${this.baseUrl}/mpesa/b2c/v1/paymentrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`M-Pesa B2C failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Generate timestamp in format YYYYMMDDHHmmss
   */
  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * Generate password for M-Pesa API
   */
  private generatePassword(timestamp: string): string {
    const str = `${this.config.businessShortCode}${this.config.passkey}${timestamp}`;
    return btoa(str);
  }

  /**
   * Format phone number to 254XXXXXXXXX
   */
  private formatPhoneNumber(phone: string): string {
    // Remove spaces, dashes, plus
    let cleaned = phone.replace(/[\s\-\+]/g, '');

    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    }

    // If doesn't start with 254, add it
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }

    return cleaned;
  }

  /**
   * Validate M-Pesa phone number (Kenyan)
   */
  validatePhoneNumber(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone);
    return /^254[17]\d{8}$/.test(formatted); // 254 followed by 7 or 1, then 8 digits
  }
}
