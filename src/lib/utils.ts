import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines Tailwind classes safely with conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number in Indian Rupee format (Lakhs and Crores).
 * Example: 11500000 -> "₹1.15 Cr", 8500000 -> "₹85.0 L"
 */
export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2);
    return `₹${cr.replace(/\.00$/, '')} Cr`;
  }
  if (amount >= 100000) {
    const lk = (amount / 100000).toFixed(2);
    return `₹${lk.replace(/\.00$/, '')} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Converts square feet to square meters.
 */
export function sqFtToSqM(sqFt: number): number {
  return Math.round(sqFt * 0.092903 * 10) / 10;
}

/**
 * Validates 10-digit Indian mobile number format.
 */
export function validateIndianMobile(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\+]/g, '');
  // Matches 10 digit starting with 6, 7, 8, or 9; or with 91 prefix
  const regex = /^(?:91)?[6-9]\d{9}$/;
  return regex.test(cleaned);
}
