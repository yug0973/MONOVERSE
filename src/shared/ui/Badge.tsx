import React from 'react';
import { cn } from '../../lib/utils';
import { FlatStatus } from '../../types/building';

export interface BadgeProps {
  status?: FlatStatus;
  variant?: 'neutral' | 'accent' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  variant = 'neutral',
  size = 'md',
  children,
  className,
  dot = false,
}) => {
  const getStatusStyles = (st: FlatStatus) => {
    switch (st) {
      case 'AVAILABLE':
        return 'bg-status-availableBg text-status-available border-status-available/20';
      case 'HELD':
        return 'bg-status-heldBg text-status-held border-status-held/25';
      case 'SOLD':
        return 'bg-status-soldBg text-status-sold border-status-sold/20';
    }
  };

  const getStatusDotColor = (st: FlatStatus) => {
    switch (st) {
      case 'AVAILABLE':
        return 'bg-status-available';
      case 'HELD':
        return 'bg-status-held';
      case 'SOLD':
        return 'bg-status-sold';
    }
  };

  const variantStyles = {
    neutral: 'bg-canvas-subtle text-ink-secondary border-canvas-muted',
    accent: 'bg-accent-terracotta/10 text-accent-terracotta border-accent-terracotta/20',
    outline: 'bg-transparent text-ink-secondary border-canvas-muted',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 tracking-wider uppercase font-semibold gap-1',
    md: 'text-xs px-2.5 py-1 tracking-normal font-medium gap-1.5',
  };

  const finalStyle = status ? getStatusStyles(status) : variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded border transition-colors select-none',
        finalStyle,
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            status ? getStatusDotColor(status) : 'bg-current'
          )}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
