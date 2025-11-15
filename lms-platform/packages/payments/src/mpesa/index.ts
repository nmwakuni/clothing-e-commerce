import { z } from 'zod';

/**
 * M-Pesa Daraja API Integration
 *
 * Safaricom's M-Pesa payment service for Kenya
 */

// Configuration
export interface MPesaConfig {
  consumerKey: string;
  consumerSecret: string;
  environment: 'sandbox' | 'production';
  shortcode: string; // Business shortcode (paybill/till number)
  passkey: string; // Lipa Na M-Pesa Online passkey
  callbackUrl: string; // URL to receive payment notifications
  initiatorName?: string; // For B2C transactions
  securityCredential?: string; // For B2C transactions
}

// STK Push Request
export interface STKPushRequest {
  phoneNumber: string; // Format: 254712345678
  amount: number; // Amount in KES
  accountReference: string; // e.g., course name, user ID
  transactionDesc: string; // Transaction description
}

// STK Push Response
export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

// Callback Response (from M-Pesa)
export interface MPesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number; // 0 = success, others = failure
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

// Transaction Status Response
export interface TransactionStatusResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

/**
 * M-Pesa Payment Service
 */
export class MPesaService {
  private config: MPesaConfig;
  private baseUrl: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor(config: MPesaConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    const auth = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString('base64');

    try {
      const response = await fetch(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get access token: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;

      // Token expires in 1 hour, refresh 5 minutes before
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

      return this.accessToken!;
    } catch (error) {
      console.error('Error getting M-Pesa access token:', error);
      throw error;
    }
  }

  /**
   * Generate timestamp for M-Pesa API
   */
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

  /**
   * Generate password for STK Push
   */
  private generatePassword(timestamp: string): string {
    const str = `${this.config.shortcode}${this.config.passkey}${timestamp}`;
    return Buffer.from(str).toString('base64');
  }

  /**
   * Format phone number to M-Pesa format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any spaces, dashes, or plus signs
    let cleaned = phone.replace(/[\s\-\+]/g, '');

    // If starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    }

    // If starts with 7 or 1 (missing country code), add 254
    if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      cleaned = '254' + cleaned;
    }

    return cleaned;
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   */
  async stkPush(request: STKPushRequest): Promise<STKPushResponse> {
    const token = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);
    const phoneNumber = this.formatPhoneNumber(request.phoneNumber);

    const payload = {
      BusinessShortCode: this.config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.floor(request.amount), // Must be integer
      PartyA: phoneNumber,
      PartyB: this.config.shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: this.config.callbackUrl,
      AccountReference: request.accountReference.slice(0, 12), // Max 12 chars
      TransactionDesc: request.transactionDesc.slice(0, 13), // Max 13 chars
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`STK Push failed: ${JSON.stringify(error)}`);
      }

      const data: STKPushResponse = await response.json();

      return data;
    } catch (error) {
      console.error('Error initiating STK Push:', error);
      throw error;
    }
  }

  /**
   * Query STK Push transaction status
   */
  async queryTransaction(checkoutRequestId: string): Promise<TransactionStatusResponse> {
    const token = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);

    const payload = {
      BusinessShortCode: this.config.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Transaction query failed: ${JSON.stringify(error)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error querying transaction:', error);
      throw error;
    }
  }

  /**
   * Parse M-Pesa callback
   */
  static parseCallback(callback: MPesaCallback): {
    success: boolean;
    merchantRequestId: string;
    checkoutRequestId: string;
    resultDesc: string;
    amount?: number;
    mpesaReceiptNumber?: string;
    transactionDate?: string;
    phoneNumber?: string;
  } {
    const { stkCallback } = callback.Body;

    const result = {
      success: stkCallback.ResultCode === 0,
      merchantRequestId: stkCallback.MerchantRequestID,
      checkoutRequestId: stkCallback.CheckoutRequestID,
      resultDesc: stkCallback.ResultDesc,
    };

    // If successful, extract additional metadata
    if (result.success && stkCallback.CallbackMetadata) {
      const metadata = stkCallback.CallbackMetadata.Item;

      const getMetadataValue = (name: string) => {
        const item = metadata.find((i) => i.Name === name);
        return item?.Value;
      };

      return {
        ...result,
        amount: Number(getMetadataValue('Amount')),
        mpesaReceiptNumber: String(getMetadataValue('MpesaReceiptNumber')),
        transactionDate: String(getMetadataValue('TransactionDate')),
        phoneNumber: String(getMetadataValue('PhoneNumber')),
      };
    }

    return result;
  }

  /**
   * Validate callback authenticity (optional security)
   */
  static validateCallback(callback: MPesaCallback): boolean {
    // Add your validation logic here
    // e.g., check if callback came from Safaricom IP
    return true;
  }

  /**
   * Register URLs (C2B)
   * Use this to register validation and confirmation URLs
   */
  async registerUrls(
    validationUrl: string,
    confirmationUrl: string
  ): Promise<any> {
    const token = await this.getAccessToken();

    const payload = {
      ShortCode: this.config.shortcode,
      ResponseType: 'Completed', // or 'Cancelled'
      ConfirmationURL: confirmationUrl,
      ValidationURL: validationUrl,
    };

    try {
      const response = await fetch(
        `${this.baseUrl}/mpesa/c2b/v1/registerurl`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Error registering URLs:', error);
      throw error;
    }
  }
}

// Helper function to create service
export function createMPesaService(config: MPesaConfig): MPesaService {
  return new MPesaService(config);
}

// Export types
export type {
  MPesaConfig,
  STKPushRequest,
  STKPushResponse,
  MPesaCallback,
  TransactionStatusResponse,
};
