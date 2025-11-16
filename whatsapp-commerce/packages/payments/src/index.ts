export * from './mpesa';
export * from './airtel';

import { MpesaService, MpesaConfig } from './mpesa';
import { AirtelMoneyService, AirtelConfig } from './airtel';

/**
 * Unified payment service that supports multiple providers
 */
export class PaymentService {
  private mpesa?: MpesaService;
  private airtel?: AirtelMoneyService;

  constructor(config: {
    mpesa?: MpesaConfig;
    airtel?: AirtelConfig;
  }) {
    if (config.mpesa) {
      this.mpesa = new MpesaService(config.mpesa);
    }

    if (config.airtel) {
      this.airtel = new AirtelMoneyService(config.airtel);
    }
  }

  /**
   * Initiate payment with automatic provider detection
   */
  async initiatePayment(
    provider: 'mpesa' | 'airtel',
    phoneNumber: string,
    amount: number,
    reference: string,
    description: string
  ): Promise<any> {
    if (provider === 'mpesa') {
      if (!this.mpesa) {
        throw new Error('M-Pesa not configured');
      }

      return await this.mpesa.initiatePayment({
        phoneNumber,
        amount,
        accountReference: reference,
        transactionDesc: description,
      });
    } else if (provider === 'airtel') {
      if (!this.airtel) {
        throw new Error('Airtel Money not configured');
      }

      return await this.airtel.initiatePayment({
        phoneNumber,
        amount,
        reference,
        description,
      });
    }

    throw new Error(`Unsupported payment provider: ${provider}`);
  }

  /**
   * Detect payment provider from phone number
   */
  detectProvider(phoneNumber: string): 'mpesa' | 'airtel' | 'unknown' {
    // Clean phone number
    const cleaned = phoneNumber.replace(/[\s\-\+]/g, '');

    // Kenyan numbers
    if (cleaned.startsWith('254') || cleaned.startsWith('0')) {
      const number = cleaned.replace(/^(254|0)/, '');

      // Safaricom (M-Pesa): 7xx, 1xx
      if (number.startsWith('7') || number.startsWith('1')) {
        return 'mpesa';
      }

      // Airtel: 73x, 78x, 1xx (some)
      if (number.startsWith('73') || number.startsWith('78') || number.startsWith('10')) {
        return 'airtel';
      }
    }

    return 'unknown';
  }

  /**
   * Send payout/refund
   */
  async sendPayout(
    provider: 'mpesa' | 'airtel',
    phoneNumber: string,
    amount: number,
    reference: string
  ): Promise<any> {
    if (provider === 'mpesa') {
      if (!this.mpesa) {
        throw new Error('M-Pesa not configured');
      }

      return await this.mpesa.sendPayout(phoneNumber, amount, reference);
    } else if (provider === 'airtel') {
      if (!this.airtel) {
        throw new Error('Airtel Money not configured');
      }

      return await this.airtel.sendPayout(phoneNumber, amount, reference);
    }

    throw new Error(`Unsupported payment provider: ${provider}`);
  }
}
