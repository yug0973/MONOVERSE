import { describe, it, expect } from 'vitest';
import { calculateEmi } from '../src/lib/emi';

describe('EMI Amortization Suite', () => {
  it('correctly calculates monthly installment using standard mathematical formula', () => {
    // 1 Crore loan, 20% down payment = 80 Lakhs principal
    // 8.5% interest, 20 years = 240 months
    const totalCost = 10000000;
    const result = calculateEmi(totalCost, 20, 8.5, 20);

    expect(result.downPaymentAmount).toBe(2000000);
    expect(result.principalLoanAmount).toBe(8000000);
    expect(result.tenureYears).toBe(20);

    // Standard EMI for 80L @ 8.5% for 20 years is ~₹69,426
    expect(result.monthlyEmi).toBeGreaterThan(68000);
    expect(result.monthlyEmi).toBeLessThan(71000);

    // Total payable must be monthly EMI * 240
    expect(result.totalPayableAmount).toBe(result.monthlyEmi * 240);
    expect(result.totalInterestPayable).toBe(result.totalPayableAmount - result.principalLoanAmount);
  });

  it('handles edge case when down payment is 100%', () => {
    const result = calculateEmi(12000000, 100, 8.5, 20);
    expect(result.principalLoanAmount).toBe(0);
    expect(result.monthlyEmi).toBe(0);
    expect(result.totalInterestPayable).toBe(0);
  });

  it('generates non-empty amortization schedule intervals', () => {
    const result = calculateEmi(15000000, 20, 8.25, 15);
    expect(result.amortizationSummary.length).toBeGreaterThanOrEqual(3);
    const lastMilestone = result.amortizationSummary[result.amortizationSummary.length - 1];
    expect(lastMilestone.year).toBe(15);
  });
});
