import React from 'react';
import { FlatData } from '../../types/building';
import { calculateFlatPrice } from '../../lib/pricing';
import { formatINR } from '../../lib/utils';
import { ShieldCheck, Receipt } from 'lucide-react';

interface PriceBreakdownCardProps {
  flat: FlatData;
}

export const PriceBreakdownCard: React.FC<PriceBreakdownCardProps> = ({ flat }) => {
  const { breakdown, totalPrice } = calculateFlatPrice(
    flat.carpetAreaSqFt,
    flat.floorNumber
  );

  return (
    <div className="space-y-4">
      {/* Total All-Inclusive Banner */}
      <div className="p-4 bg-canvas-subtle rounded-lg border border-canvas-muted flex items-center justify-between">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-ink-muted font-medium">
            All-Inclusive Residence Value
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-semibold text-ink-primary">
            {formatINR(totalPrice)}
          </div>
        </div>
        <div className="text-right text-xs text-ink-muted">
          <div>Floor {flat.floorNumber} · Unit {flat.unitNumber}</div>
          <div className="font-mono text-ink-secondary">{flat.carpetAreaSqFt} sq ft</div>
        </div>
      </div>

      {/* Itemized Cost Breakdown Table */}
      <div className="border border-canvas-muted rounded-lg overflow-hidden bg-canvas-light text-xs">
        <div className="px-4 py-2.5 bg-canvas-subtle/50 font-medium text-ink-primary border-b border-canvas-muted flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-accent-terracotta" />
          <span>Itemized Cost Schedule</span>
        </div>

        <div className="divide-y divide-canvas-muted/70 px-4">
          <div className="py-2.5 flex justify-between items-center">
            <div>
              <span className="text-ink-primary font-medium">Carpet Area Base Value</span>
              <div className="text-[11px] text-ink-muted font-mono">
                {flat.carpetAreaSqFt} sq ft @ ₹{breakdown.baseRatePerSqFt.toLocaleString()}/sq ft
              </div>
            </div>
            <span className="font-mono font-medium text-ink-primary">
              {formatINR(breakdown.baseCost)}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <div>
              <span className="text-ink-primary font-medium">Floor Rise Surcharge</span>
              <div className="text-[11px] text-ink-muted font-mono">
                Floor {flat.floorNumber} (₹{breakdown.floorRiseRatePerSqFt}/sq ft/floor)
              </div>
            </div>
            <span className="font-mono font-medium text-ink-primary">
              {breakdown.floorRiseTotal > 0 ? formatINR(breakdown.floorRiseTotal) : 'Nil (Base Level)'}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <span className="text-ink-secondary">Clubhouse & Community Amenities</span>
            <span className="font-mono font-medium text-ink-primary">
              {formatINR(breakdown.clubAmenitiesCharge)}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <span className="text-ink-secondary">Covered Basement Car Parking Slot</span>
            <span className="font-mono font-medium text-ink-primary">
              {formatINR(breakdown.coveredParkingSlot)}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center bg-canvas-subtle/30 font-medium">
            <span className="text-ink-primary font-semibold">Net Agreement Value</span>
            <span className="font-mono font-semibold text-ink-primary">
              {formatINR(breakdown.netAgreementValue)}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <div>
              <span className="text-ink-secondary">GST on Construction (5%)</span>
              <div className="text-[10px] text-ink-muted">Under-construction residential rate</div>
            </div>
            <span className="font-mono text-ink-secondary">
              {formatINR(breakdown.gstAmount)}
            </span>
          </div>

          <div className="py-2.5 flex justify-between items-center">
            <div>
              <span className="text-ink-secondary">Stamp Duty & Registration (~5.9%)</span>
              <div className="text-[10px] text-ink-muted">Government statutory estimate</div>
            </div>
            <span className="font-mono text-ink-secondary">
              {formatINR(breakdown.stampDutyAndRegistration)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
        <ShieldCheck className="w-3.5 h-3.5 text-accent-brass" />
        <span>RERA Registered Project · Registration DEMO-RERA-0000 · Prices transparent with no hidden overheads.</span>
      </div>
    </div>
  );
};
