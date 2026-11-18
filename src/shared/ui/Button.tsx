import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'terracotta';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none rounded focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';

    const variants = {
      primary:
        'bg-ink-primary text-canvas hover:bg-ink-secondary active:bg-black focus-visible:outline-ink-primary shadow-soft',
      terracotta:
        'bg-accent-terracotta text-white hover:bg-accent-terracotta-hover active:bg-[#934526] focus-visible:outline-accent-terracotta shadow-soft',
      secondary:
        'bg-canvas-subtle text-ink-primary hover:bg-canvas-muted active:bg-[#D8D0C3] focus-visible:outline-ink-primary border border-canvas-muted/80',
      outline:
        'border border-ink-primary/25 bg-transparent text-ink-primary hover:bg-ink-primary/5 active:bg-ink-primary/10 focus-visible:outline-ink-primary',
      ghost:
        'bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-ink-primary/5 active:bg-ink-primary/10 focus-visible:outline-ink-primary',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 tracking-wide uppercase',
      md: 'text-sm px-4 py-2 gap-2 tracking-normal',
      lg: 'text-base px-6 py-3 gap-2.5 tracking-normal',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
