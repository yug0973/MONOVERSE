import { FlatCustomizationState } from './customizer';
import { FlatType } from './building';

export interface PriceBreakdown {
  carpetAreaSqFt: number;
  baseRatePerSqFt: number;
  baseCost: number;
  floorRiseRatePerSqFt: number;
  floorRiseTotal: number;
  clubAmenitiesCharge: number;
  coveredParkingSlot: number;
  netAgreementValue: number;
  gstAmount: number; // 5%
  stampDutyAndRegistration: number; // ~6% Gujarat estimate
  totalAllInclusivePrice: number;
}

export interface EmiScheduleItem {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface EmiResult {
  principalLoanAmount: number;
  downPaymentAmount: number;
  interestRateAnnual: number;
  tenureYears: number;
  monthlyEmi: number;
  totalInterestPayable: number;
  totalPayableAmount: number;
  amortizationSummary: EmiScheduleItem[];
}

export interface PaymentMilestone {
  stage: string;
  percentage: number;
  amount: number;
  description: string;
}

export interface SiteVisitEnquiry {
  id: string;
  createdAt: string;
  customerName: string;
  phoneNumber: string; // Indian 10-digit format
  email: string;
  preferredDate: string;
  timeSlot: string; // e.g. "10:00 AM - 12:00 PM"
  flatId: string;
  flatCode: string;
  floorNumber: number;
  flatType: FlatType;
  carpetAreaSqFt: number;
  estimatedPrice: number;
  customization: FlatCustomizationState;
  shareableUrl: string;
  message?: string;
  status: 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'ARCHIVED';
}
