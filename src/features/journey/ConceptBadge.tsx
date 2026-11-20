import React from 'react';
import { EXPERIENCE_CONFIG } from '../../config/experience.config';
import { Sparkles } from 'lucide-react';

interface ConceptBadgeProps {
  className?: string;
  position?: 'bottom-left' | 'top-right' | 'bottom-right';
}

/**
 * Architectural Concept Disclaimer Watermark
 * Ensures compliance with the required "Concept render / artist's impression" label
 */
export const ConceptBadge: React.FC<ConceptBadgeProps> = ({
  className = '',
  position = 'bottom-left',
}) => {
  const positionClasses = {
    'bottom-left': 'bottom-4 left-4 sm:bottom-6 sm:left-6',
    'top-right': 'top-20 right-4 sm:top-24 sm:right-6',
    'bottom-right': 'bottom-4 right-4 sm:bottom-6 sm:right-6',
  }[position];

  return (
    <div
      role="note"
      aria-label="Visual disclosure notice"
      className={`absolute z-30 pointer-events-none select-none flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#070D18]/75 backdrop-blur-md border border-white/10 text-[10px] tracking-wide text-white/80 uppercase font-sans ${positionClasses} ${className}`}
    >
      <Sparkles className="w-3 h-3 text-[#B5654A] flex-shrink-0" aria-hidden="true" />
      <span>{EXPERIENCE_CONFIG.conceptNoticeText}</span>
    </div>
  );
};
