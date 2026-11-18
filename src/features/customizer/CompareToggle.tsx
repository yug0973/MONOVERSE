import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { RotateCcw, SplitSquareVertical } from 'lucide-react';

export const CompareToggle: React.FC = () => {
  const {
    isComparingOriginal,
    toggleCompareOriginal,
    resetCustomization,
  } = useAppStore();

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-canvas-muted">
      {/* Compare with Original Toggle */}
      <button
        onClick={toggleCompareOriginal}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-medium transition-all border ${
          isComparingOriginal
            ? 'bg-accent-terracotta text-white border-accent-terracotta shadow-soft'
            : 'bg-canvas-light text-ink-primary border-canvas-muted hover:bg-canvas-subtle'
        }`}
        title="Toggle between your customized finishes and the baseline architectural specification"
      >
        <SplitSquareVertical className="w-3.5 h-3.5" />
        <span>{isComparingOriginal ? 'Viewing Original' : 'Compare Original'}</span>
      </button>

      {/* Reset Customization Button */}
      <button
        onClick={resetCustomization}
        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded text-xs font-medium bg-canvas-light text-ink-muted border border-canvas-muted hover:text-ink-primary hover:bg-canvas-subtle transition-all"
        title="Reset all finishes to default"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset</span>
      </button>
    </div>
  );
};
