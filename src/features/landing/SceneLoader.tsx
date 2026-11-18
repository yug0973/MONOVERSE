import React, { useState, useEffect } from 'react';
import { useProgress } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export const SceneLoader: React.FC = () => {
  const { active, progress } = useProgress();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => setDismissed(true), 500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // Safety fallback: dismiss after 10s regardless
  useEffect(() => {
    const safetyTimer = setTimeout(() => setDismissed(true), 10000);
    return () => clearTimeout(safetyTimer);
  }, []);

  const isVisible = active && !dismissed;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-canvas text-ink-primary p-6 select-none"
        >
          <div className="w-full max-w-xs text-center">
            <div className="font-serif text-2xl sm:text-3xl font-medium tracking-wide mb-1">
              Aarohan Residences
            </div>
            <div className="text-[11px] tracking-[0.25em] uppercase font-sans text-ink-muted mb-8">
              Constructing 3D Architectural Scene
            </div>

            {/* Real Progress Bar */}
            <div className="w-full h-1 bg-canvas-muted rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-accent-terracotta"
                style={{ width: `${Math.round(progress)}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-ink-muted font-mono">
              <span>Compiling Shaders</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
