import React, { useState } from 'react';
import { calculateEmi } from '../../lib/emi';
import { formatINR } from '../../lib/utils';
import { Calculator } from 'lucide-react';

interface EmiCalculatorProps {
  totalPrice: number;
}

export const EmiCalculator: React.FC<EmiCalculatorProps> = ({ totalPrice }) => {
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);

  const emiData = calculateEmi(
    totalPrice,
    downPaymentPercent,
    interestRate,
    tenureYears
  );

  return (
    <div className="space-y-5">
      {/* Monthly Installment Headline */}
      <div className="p-4 bg-canvas-subtle rounded-lg border border-canvas-muted flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-ink-muted font-medium flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-accent-terracotta" />
            <span>Estimated Monthly Installment</span>
          </span>
          <div className="font-serif text-3xl font-semibold text-accent-terracotta mt-0.5">
            ₹{emiData.monthlyEmi.toLocaleString('en-IN')}{' '}
            <span className="text-xs font-sans text-ink-muted font-normal">/ month</span>
          </div>
        </div>

        <div className="text-right text-xs">
          <div className="text-ink-muted">Principal Loan</div>
          <div className="font-mono font-medium text-ink-primary">
            {formatINR(emiData.principalLoanAmount)}
          </div>
        </div>
      </div>

      {/* Interactive Financial Sliders */}
      <div className="space-y-4 p-4 bg-canvas-light rounded-lg border border-canvas-muted text-xs">
        {/* Down Payment Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium">
            <span className="text-ink-secondary">Down Payment ({downPaymentPercent}%)</span>
            <span className="font-mono text-ink-primary">
              {formatINR(emiData.downPaymentAmount)}
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={50}
            step={5}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full accent-accent-terracotta cursor-pointer"
          />
        </div>

        {/* Interest Rate Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium">
            <span className="text-ink-secondary">Interest Rate</span>
            <span className="font-mono text-ink-primary">{interestRate}% p.a.</span>
          </div>
          <input
            type="range"
            min={7.5}
            max={11.5}
            step={0.25}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full accent-accent-terracotta cursor-pointer"
          />
        </div>

        {/* Tenure Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between font-medium">
            <span className="text-ink-secondary">Loan Tenure</span>
            <span className="font-mono text-ink-primary">{tenureYears} Years</span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full accent-accent-terracotta cursor-pointer"
          />
        </div>
      </div>

      {/* Clean Amortization Schedule Chart (SVG) */}
      <div className="p-4 bg-canvas-light rounded-lg border border-canvas-muted text-xs">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-ink-primary">Amortization Overview</span>
          <div className="flex items-center gap-3 text-[11px] text-ink-muted">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-terracotta inline-block" />
              <span>Principal</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-brass inline-block" />
              <span>Interest</span>
            </span>
          </div>
        </div>

        {/* Proportional Split Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden bg-canvas-muted flex mb-4">
          <div
            style={{
              width: `${(emiData.principalLoanAmount / emiData.totalPayableAmount) * 100}%`,
            }}
            className="bg-accent-terracotta h-full transition-all"
            title="Principal Amount"
          />
          <div
            style={{
              width: `${(emiData.totalInterestPayable / emiData.totalPayableAmount) * 100}%`,
            }}
            className="bg-accent-brass h-full transition-all"
            title="Total Interest"
          />
        </div>

        {/* Milestone Snapshot Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center text-[11px]">
          {emiData.amortizationSummary.map((item) => (
            <div key={item.year} className="p-2 rounded bg-canvas-subtle/60 border border-canvas-muted/50">
              <div className="font-medium text-ink-muted">Yr {item.year}</div>
              <div className="font-mono font-semibold text-ink-primary mt-0.5">
                {formatINR(item.remainingBalance)}
              </div>
              <div className="text-[10px] text-ink-muted">Bal</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
