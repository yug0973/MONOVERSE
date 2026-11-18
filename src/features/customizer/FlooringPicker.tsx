import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FLOORING_OPTIONS } from '../../data/customizerPalettes';
import { FlooringId } from '../../types/customizer';
import { Check } from 'lucide-react';

export const FlooringPicker: React.FC = () => {
  const { customization, setFlooring } = useAppStore();

  return (
    <div className="space-y-2.5">
      {FLOORING_OPTIONS.map((opt) => {
        const isSelected = customization.flooring === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => setFlooring(opt.id as FlooringId)}
            className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all ${
              isSelected
                ? 'border-accent-terracotta bg-accent-terracotta/5 ring-1 ring-accent-terracotta shadow-soft'
                : 'border-canvas-muted bg-canvas-light hover:bg-canvas-subtle'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Material preview chip */}
              <div
                className="w-9 h-9 rounded border border-ink-primary/10 shrink-0 shadow-inner"
                style={{ backgroundColor: opt.accentColor }}
              />
              <div>
                <div className="text-xs font-medium text-ink-primary">
                  {opt.name}
                </div>
                <div className="text-[11px] text-ink-muted">
                  {opt.tagline}
                </div>
              </div>
            </div>

            <div className="shrink-0 pl-2">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'border-accent-terracotta bg-accent-terracotta text-white'
                    : 'border-canvas-muted bg-canvas'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
