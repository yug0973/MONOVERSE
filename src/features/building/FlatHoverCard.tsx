import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { Badge } from '../../shared/ui/Badge';
import { formatINR } from '../../lib/utils';
import { Compass, Maximize2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FlatHoverCard: React.FC = () => {
  const { hoveredFlatId, selectFlat } = useAppStore();

  const flat = hoveredFlatId ? getFlatById(hoveredFlatId) : null;

  return (
    <AnimatePresence>
      {flat && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="absolute right-4 sm:right-6 top-20 z-20 w-80 max-w-[calc(100vw-32px)] bg-canvas-light/95 backdrop-blur-md border border-canvas-muted rounded-lg p-5 shadow-elevation pointer-events-auto"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-[11px] font-mono text-ink-muted uppercase tracking-wider">
                Floor {flat.floorNumber} · Unit {flat.unitNumber}
              </span>
              <h4 className="font-serif text-xl font-medium text-ink-primary">
                {flat.type.replace('_', ' ')}
              </h4>
            </div>
            <Badge status={flat.status} dot size="sm">
              {flat.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3 py-2 border-y border-canvas-muted text-xs">
            <div className="flex items-center gap-1.5 text-ink-muted">
              <Maximize2 className="w-3.5 h-3.5 text-accent-brass" />
              <span>
                <strong className="text-ink-primary font-medium">{flat.carpetAreaSqFt}</strong> sq ft carpet
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-ink-muted">
              <Compass className="w-3.5 h-3.5 text-accent-brass" />
              <span>
                Facing <strong className="text-ink-primary font-medium">{flat.facing}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-1">
            <div>
              <div className="text-[10px] uppercase text-ink-muted tracking-wider">
                All-Inclusive Price
              </div>
              <div className="font-serif text-lg font-semibold text-ink-primary">
                {formatINR(flat.totalPrice)}
              </div>
            </div>

            <button
              disabled={flat.status === 'SOLD'}
              onClick={() => selectFlat(flat.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-ink-primary text-canvas text-xs font-medium hover:bg-ink-secondary active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft"
            >
              <span>{flat.status === 'SOLD' ? 'Unit Sold' : 'Enter Flat'}</span>
              {flat.status !== 'SOLD' && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
