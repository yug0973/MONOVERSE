import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { BUILDING_FLOORS } from '../../data/buildingData';
import { Badge } from '../../shared/ui/Badge';
import { formatINR } from '../../lib/utils';
import {
  Layers,
  X,
  Compass,
  Maximize2,
  ArrowRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Senior Architectural Floor Details Panel (Module 3)
 * - Opens when a floor is clicked/selected.
 * - Desktop: Floating docked side panel on the right.
 * - Mobile: Interactive bottom sheet drawer.
 * - Lists the four flats with unit letter, BHK, carpet area, facing, price, and status (Available/Sold/Held)
 *   from real building data.
 */
export const FloorDetailsPanel: React.FC = () => {
  const {
    viewMode,
    selectedFloorNumber,
    hoveredFlatId,
    selectFloor,
    selectFlat,
    setHoveredFlat,
  } = useAppStore();

  const isVisible =
    (viewMode === 'building' || viewMode === 'floor_slice') &&
    selectedFloorNumber !== null;

  const floor = BUILDING_FLOORS.find((f) => f.floorNumber === selectedFloorNumber);

  const handleNextFloor = React.useCallback(() => {
    const cur = useAppStore.getState().selectedFloorNumber;
    if (cur !== null && cur < 14) {
      selectFloor(cur + 1);
    }
  }, [selectFloor]);

  const handlePrevFloor = React.useCallback(() => {
    const cur = useAppStore.getState().selectedFloorNumber;
    if (cur !== null && cur > 1) {
      selectFloor(cur - 1);
    }
  }, [selectFloor]);

  // Global Keyboard Navigation: Esc to deselect, Up/Down to scrub floors (Module 3)
  React.useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        selectFloor(null);
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'PageUp') {
        e.preventDefault();
        handleNextFloor();
      } else if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'PageDown') {
        e.preventDefault();
        handlePrevFloor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleNextFloor, handlePrevFloor, selectFloor]);

  if (!isVisible || !floor) return null;

  const availableCount = floor.flats.filter((f) => f.status === 'AVAILABLE').length;
  const heldCount = floor.flats.filter((f) => f.status === 'HELD').length;

  return (
    <AnimatePresence>
      <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-end md:static md:inset-auto">
        {/* DESKTOP SIDE PANEL (Right-Docked) */}
        <motion.aside
          initial={{ opacity: 0, x: 24, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 24, scale: 0.98 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          aria-label={`Floor ${selectedFloorNumber} Inventory`}
          className="hidden md:flex pointer-events-auto absolute right-6 top-20 bottom-24 w-[390px] max-w-[calc(100vw-3rem)] flex-col bg-canvas-light/95 backdrop-blur-md border border-canvas-muted rounded-xl shadow-elevation overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-canvas-muted bg-canvas-subtle/50 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-accent-terracotta text-white shadow-soft">
                  <Layers className="w-3 h-3" />
                  <span>Floor {selectedFloorNumber < 10 ? `0${selectedFloorNumber}` : selectedFloorNumber}</span>
                </span>
                <span className="text-[11px] text-ink-muted">
                  {Math.round(floor.elevationMeters)}m Elevation
                </span>
              </div>
              <h3 className="font-serif text-lg font-medium text-ink-primary">
                {floor.title}
              </h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                <strong className="text-emerald-600 font-semibold">{availableCount} Available</strong>
                {heldCount > 0 && <span> · {heldCount} On Hold</span>}
                <span> · 4 Units / Floor</span>
              </p>
            </div>

            <div className="flex items-center gap-1">
              {/* Floor Steppers */}
              <div className="flex items-center border border-canvas-muted rounded-md bg-canvas-light">
                <button
                  onClick={handleNextFloor}
                  disabled={selectedFloorNumber === 14}
                  className="p-1 text-ink-secondary hover:text-ink-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Next Floor (Up)"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handlePrevFloor}
                  disabled={selectedFloorNumber === 1}
                  className="p-1 text-ink-secondary hover:text-ink-primary disabled:opacity-30 disabled:cursor-not-allowed border-l border-canvas-muted transition-colors"
                  title="Previous Floor (Down)"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Close Panel Button */}
              <button
                onClick={() => selectFloor(null)}
                className="p-1.5 text-ink-muted hover:text-ink-primary rounded-md hover:bg-canvas-subtle transition-colors"
                title="Close Floor Inspection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Flats List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {floor.flats.map((flat) => {
              const isHovered = hoveredFlatId === flat.id;
              const isSold = flat.status === 'SOLD';

              return (
                <div
                  key={flat.id}
                  onMouseEnter={() => setHoveredFlat(flat.id)}
                  onMouseLeave={() => setHoveredFlat(null)}
                  className={`relative p-3.5 rounded-lg border transition-all ${
                    isHovered
                      ? 'border-accent-terracotta bg-accent-terracotta/5 shadow-card'
                      : isSold
                      ? 'border-canvas-muted bg-canvas-subtle/40 opacity-75'
                      : 'border-canvas-muted bg-canvas-light hover:border-canvas-muted/80 hover:shadow-soft'
                  }`}
                >
                  {/* Unit Title & Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-ink-primary">
                          Unit {flat.unitNumber}
                        </span>
                        <span className="text-[10px] text-ink-muted font-mono">
                          (#{flat.code})
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-medium text-ink-primary">
                        {flat.type.replace('_', ' ')}
                      </h4>
                    </div>

                    <Badge status={flat.status} dot size="sm">
                      {flat.status}
                    </Badge>
                  </div>

                  {/* Spatial Specs (Carpet, Balcony, Facing) */}
                  <div className="grid grid-cols-2 gap-2 my-2.5 py-2 border-y border-canvas-muted/60 text-xs">
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <Maximize2 className="w-3.5 h-3.5 text-accent-brass" />
                      <span>
                        <strong className="text-ink-primary font-medium">{flat.carpetAreaSqFt}</strong> sq ft
                        <span className="text-[10px] text-ink-muted ml-1">+{flat.balconyAreaSqFt} balc</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <Compass className="w-3.5 h-3.5 text-accent-brass" />
                      <span>
                        Facing <strong className="text-ink-primary font-medium">{flat.facing}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Financials & Action */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-ink-muted">
                        All-Inclusive Price
                      </div>
                      <div className="font-serif text-base font-semibold text-ink-primary">
                        {formatINR(flat.totalPrice)}
                      </div>
                    </div>

                    <button
                      disabled={isSold}
                      onClick={() => selectFlat(flat.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all shadow-soft ${
                        isSold
                          ? 'bg-canvas-muted text-ink-muted cursor-not-allowed opacity-50'
                          : 'bg-ink-primary text-canvas hover:bg-accent-terracotta active:scale-[0.98]'
                      }`}
                    >
                      <span>{isSold ? 'Sold' : 'View Flat'}</span>
                      {!isSold && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.aside>

        {/* MOBILE BOTTOM SHEET (Drawer) */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          aria-label={`Floor ${selectedFloorNumber} Inventory Sheet`}
          className="md:hidden pointer-events-auto fixed inset-x-0 bottom-0 z-30 max-h-[75vh] flex flex-col bg-canvas-light/98 backdrop-blur-md border-t border-canvas-muted rounded-t-2xl shadow-elevation"
        >
          {/* Pull Handle */}
          <div className="w-full flex justify-center pt-2.5 pb-1">
            <div className="w-10 h-1 rounded-full bg-ink-muted/30" />
          </div>

          {/* Mobile Header */}
          <div className="px-4 py-2 border-b border-canvas-muted flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-accent-terracotta text-white">
                  Floor {selectedFloorNumber}
                </span>
                <span className="font-serif text-sm font-medium text-ink-primary">
                  {floor.title}
                </span>
              </div>
              <span className="text-[11px] text-ink-muted">
                {availableCount} of 4 Available
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevFloor}
                disabled={selectedFloorNumber === 1}
                className="p-1 rounded text-ink-muted hover:text-ink-primary disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextFloor}
                disabled={selectedFloorNumber === 14}
                className="p-1 rounded text-ink-muted hover:text-ink-primary disabled:opacity-30"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => selectFloor(null)}
                className="p-1.5 rounded-full text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Flat List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {floor.flats.map((flat) => {
              const isSold = flat.status === 'SOLD';

              return (
                <div
                  key={`mobile-${flat.id}`}
                  className="p-3 rounded-lg border border-canvas-muted bg-canvas-light shadow-soft flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-semibold text-ink-primary mr-1.5">
                        Unit {flat.unitNumber}
                      </span>
                      <span className="font-serif text-sm font-medium text-ink-primary">
                        {flat.type.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge status={flat.status} dot size="sm">
                      {flat.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-ink-secondary py-1 border-y border-canvas-muted/50">
                    <span>{flat.carpetAreaSqFt} sq ft carpet</span>
                    <span>Facing {flat.facing}</span>
                    <strong className="text-ink-primary font-serif">{formatINR(flat.totalPrice)}</strong>
                  </div>

                  <button
                    disabled={isSold}
                    onClick={() => selectFlat(flat.id)}
                    className={`w-full py-2 rounded text-xs font-medium flex items-center justify-center gap-1.5 ${
                      isSold
                        ? 'bg-canvas-muted text-ink-muted cursor-not-allowed opacity-50'
                        : 'bg-ink-primary text-canvas hover:bg-accent-terracotta'
                    }`}
                  >
                    <span>{isSold ? 'Sold' : 'View Flat'}</span>
                    {!isSold && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
