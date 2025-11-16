import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in KES
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format phone number for WhatsApp
 */
export function formatWhatsAppNumber(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If starts with 0, replace with 254
  if (digits.startsWith('0')) {
    return '254' + digits.slice(1);
  }

  // If starts with +254, remove the +
  if (digits.startsWith('254')) {
    return digits;
  }

  // Otherwise assume it's missing country code
  return '254' + digits;
}

/**
 * Calculate reading time for markdown content
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Truncate text to a certain length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}
