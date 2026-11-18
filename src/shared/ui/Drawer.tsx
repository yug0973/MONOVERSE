import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  position?: 'bottom' | 'right';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  position = 'bottom',
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const slideVariants = {
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
  };

  const posClasses = {
    bottom: 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-xl border-t',
    right: 'top-0 right-0 bottom-0 w-full max-w-md border-l',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink-primary/40 backdrop-blur-xs"
          />

          {/* Drawer Content */}
          <motion.div
            initial={slideVariants[position].initial}
            animate={slideVariants[position].animate}
            exit={slideVariants[position].exit}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'fixed bg-canvas border-canvas-muted shadow-elevation flex flex-col z-10',
              posClasses[position],
              className
            )}
          >
            {/* Grab handle for bottom sheet */}
            {position === 'bottom' && (
              <div className="w-12 h-1 bg-canvas-muted rounded-full mx-auto my-2.5 shrink-0" />
            )}

            {/* Header */}
            {(title || subtitle) && (
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-canvas-muted shrink-0">
                <div>
                  {title && (
                    <h3 className="font-serif text-xl font-medium text-ink-primary">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-ink-muted">{subtitle}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="p-1.5 text-ink-muted hover:text-ink-primary rounded hover:bg-canvas-subtle"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Scrollable Children */}
            <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
