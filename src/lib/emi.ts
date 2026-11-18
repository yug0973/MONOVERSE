import { EmiResult, EmiScheduleItem } from '../types/enquiry';

/**
 * Standard Equated Monthly Installment (EMI) formula:
 * E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 *
 * @param principal Principal loan amount in INR
 * @param annualInterestRate Annual interest rate as percentage (e.g. 8.5 for 8.5%)
 * @param tenureYears Loan tenure in years (e.g. 20)
 */
export function calculateEmi(
  totalCost: number,
  downPaymentPercent: number = 20,
  annualInterestRate: number = 8.5,
  tenureYears: number = 20
): EmiResult {
  const downPaymentAmount = Math.round((totalCost * downPaymentPercent) / 100);
  const principalLoanAmount = totalCost - downPaymentAmount;

  if (principalLoanAmount <= 0) {
    return {
      principalLoanAmount: 0,
      downPaymentAmount: totalCost,
      interestRateAnnual: annualInterestRate,
      tenureYears,
      monthlyEmi: 0,
      totalInterestPayable: 0,
      totalPayableAmount: totalCost,
      amortizationSummary: [],
    };
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  const totalMonths = tenureYears * 12;

  // E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
  const monthlyEmi = Math.round(
    (principalLoanAmount * monthlyRate * compoundFactor) / (compoundFactor - 1)
  );

  const totalPayableAmount = monthlyEmi * totalMonths;
  const totalInterestPayable = totalPayableAmount - principalLoanAmount;

  // Generate 5-year snapshot intervals for clean visual charts
  const amortizationSummary: EmiScheduleItem[] = [];
  let balance = principalLoanAmount;

  for (let year = 1; year <= tenureYears; year++) {
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let month = 1; month <= 12; month++) {
      const interestForMonth = balance * monthlyRate;
      const principalForMonth = monthlyEmi - interestForMonth;

      yearInterest += interestForMonth;
      yearPrincipal += principalForMonth;
      balance = Math.max(0, balance - principalForMonth);
    }

    // Capture every 2-5 years or key milestones
    if (year === 1 || year % 5 === 0 || year === tenureYears) {
      amortizationSummary.push({
        year,
        principalPaid: Math.round(yearPrincipal),
        interestPaid: Math.round(yearInterest),
        remainingBalance: Math.round(balance),
      });
    }
  }

  return {
    principalLoanAmount,
    downPaymentAmount,
    interestRateAnnual: annualInterestRate,
    tenureYears,
    monthlyEmi,
    totalInterestPayable,
    totalPayableAmount,
    amortizationSummary,
  };
}
