import React from 'react';
import { calculatePaymentSchedule } from '../../lib/pricing';
import { formatINR } from '../../lib/utils';
import { CheckCircle2, Clock } from 'lucide-react';

interface PaymentStagesProps {
  totalPrice: number;
}

export const PaymentStages: React.FC<PaymentStagesProps> = ({ totalPrice }) => {
  const schedule = calculatePaymentSchedule(totalPrice);

  return (
    <div className="space-y-3">
      <div className="p-3 bg-canvas-subtle rounded border border-canvas-muted text-xs text-ink-muted">
        Construction-linked milestone payment schedule adhering to Gujarat RERA regulatory norms.
      </div>

      <div className="divide-y divide-canvas-muted border border-canvas-muted rounded-lg bg-canvas-light text-xs overflow-hidden">
        {schedule.map((item, index) => {
          const isInitial = index === 0;

          return (
            <div key={item.stage} className="p-3.5 flex items-start justify-between gap-3 hover:bg-canvas-subtle/50 transition-colors">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {isInitial ? (
                    <CheckCircle2 className="w-4 h-4 text-status-available" />
                  ) : (
                    <Clock className="w-4 h-4 text-ink-muted" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-ink-primary flex items-center gap-2">
                    <span>{item.stage}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-canvas-subtle text-accent-terracotta font-mono font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono font-semibold text-ink-primary">
                  {formatINR(item.amount)}
                </div>
                <div className="text-[10px] text-ink-muted">Due at stage</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
