/**
 * Payment processing package
 *
 * Supports multiple payment providers:
 * - M-Pesa (Safaricom Daraja API)
 * - Cards (future: Stripe, Flutterwave)
 * - Bank transfers (future)
 */

export * from './mpesa';

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// Payment method enum
export enum PaymentMethod {
  MPESA = 'mpesa',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  FREE = 'free',
}

// Generic payment record
export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider?: string;
  providerTransactionId?: string;
  providerReference?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
  failedReason?: string;
}

// Helper function to determine payment method from phone number
export function detectPaymentMethod(identifier: string): PaymentMethod {
  // Clean identifier
  const cleaned = identifier.replace(/[\s\-\+]/g, '');

  // Check if it's a Kenyan phone number (M-Pesa)
  if (
    cleaned.startsWith('254') ||
    cleaned.startsWith('07') ||
    cleaned.startsWith('01')
  ) {
    return PaymentMethod.MPESA;
  }

  // Check if it looks like a card number
  if (/^\d{13,19}$/.test(cleaned)) {
    return PaymentMethod.CARD;
  }

  // Default
  return PaymentMethod.MPESA;
}

// Helper function to format amount for display
export function formatAmount(amount: number, currency = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Helper function to validate amount
export function validateAmount(amount: number, min = 1, max = 150000): boolean {
  // M-Pesa limits: KES 1 - 150,000
  return amount >= min && amount <= max && Number.isInteger(amount);
}
