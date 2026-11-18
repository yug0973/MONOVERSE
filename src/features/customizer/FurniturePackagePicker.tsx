import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FURNITURE_TIERS } from '../../data/customizerPalettes';
import { FurnitureTier } from '../../types/customizer';
import { formatINR } from '../../lib/utils';
import { Check, Armchair } from 'lucide-react';

export const FurniturePackagePicker: React.FC = () => {
  const { customization, setFurniturePackage } = useAppStore();

  return (
    <div className="space-y-3">
      {FURNITURE_TIERS.map((tier) => {
        const isSelected = customization.furniturePackage === tier.id;

        return (
          <button
            key={tier.id}
            onClick={() => setFurniturePackage(tier.id as FurnitureTier)}
            className={`w-full p-3.5 rounded border text-left transition-all ${
              isSelected
                ? 'border-accent-terracotta bg-accent-terracotta/5 ring-1 ring-accent-terracotta shadow-soft'
                : 'border-canvas-muted bg-canvas-light hover:bg-canvas-subtle'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Armchair className="w-4 h-4 text-accent-terracotta shrink-0" />
                <div className="text-xs font-semibold text-ink-primary">
                  {tier.title}
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'border-accent-terracotta bg-accent-terracotta text-white'
                    : 'border-canvas-muted bg-canvas'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
            </div>

            <p className="text-[11px] text-ink-muted leading-relaxed mt-2 mb-2.5">
              {tier.description}
            </p>

            <div className="flex items-center justify-between text-[11px] border-t border-canvas-muted/60 pt-2 text-ink-secondary">
              <span>{tier.pieceCount === 0 ? 'Raw volumetric shell' : `${tier.pieceCount} curated pieces`}</span>
              <span className="font-medium text-ink-primary">
                {tier.approxAddedCost === 0 ? 'Included in base' : `+ ${formatINR(tier.approxAddedCost)}`}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
