import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { TimeOfDay } from '../../types/customizer';

const TIME_CYCLE: TimeOfDay[] = ['morning', 'noon', 'golden_hour', 'night'];

const TIME_LABELS: Record<TimeOfDay, { name: string; time: string; angle: number }> = {
  morning: { name: 'Morning Glow', time: '08:30 AM', angle: 65 },
  noon: { name: 'Zenith Sun', time: '12:30 PM', angle: 180 },
  golden_hour: { name: 'Golden Hour', time: '05:45 PM', angle: 255 },
  night: { name: 'Dusk Ambient', time: '09:00 PM', angle: 340 },
};

export const CompassWidget: React.FC = () => {
  const { customization, setTimeOfDay, selectedFlatId, viewMode } = useAppStore();
  const currentPreset = TIME_LABELS[customization.timeOfDay];

  const selectedFlat = selectedFlatId ? getFlatById(selectedFlatId) : null;

  if (viewMode === 'panorama' || viewMode === 'flat_flyin') return null;

  const cycleTimeOfDay = () => {
    const currentIndex = TIME_CYCLE.indexOf(customization.timeOfDay);
    const nextIndex = (currentIndex + 1) % TIME_CYCLE.length;
    setTimeOfDay(TIME_CYCLE[nextIndex]);
  };

  const isNight = customization.timeOfDay === 'night';

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="absolute top-2.5 left-3 sm:top-4 sm:left-4 z-20 pointer-events-auto"
    >
      <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-canvas-light/90 backdrop-blur-md border border-canvas-muted shadow-soft">
        {/* Interactive Rotating Compass Dial */}
        <button
          onClick={cycleTimeOfDay}
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-canvas-muted flex items-center justify-center hover:scale-105 active:scale-95 transition-transform bg-canvas-subtle/60 group shrink-0"
          title="Click to cycle sun position"
          aria-label={`Current sun position: ${currentPreset.name}. Click to advance.`}
        >
          {/* Outer Compass Tick Rings */}
          <div className="absolute inset-0.5 rounded-full border border-dashed border-canvas-muted/60" />

          {/* North Marker */}
          <span className="absolute top-0.5 font-mono text-[7px] font-bold text-accent-terracotta">
            N
          </span>
          <span className="absolute bottom-0.5 font-mono text-[6px] text-ink-muted/50">
            S
          </span>
          <span className="absolute left-0.5 font-mono text-[6px] text-ink-muted/50">
            W
          </span>
          <span className="absolute right-0.5 font-mono text-[6px] text-ink-muted/50">
            E
          </span>

          {/* Orbiting Sun / Moon Indicator */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-700 ease-out"
            style={{ transform: `rotate(${currentPreset.angle}deg)` }}
          >
            <div className="w-2.5 h-2.5 -translate-y-3.5 rounded-full bg-accent-terracotta text-white flex items-center justify-center shadow-sm">
              {isNight ? (
                <Moon className="w-1.5 h-1.5" />
              ) : (
                <Sun className="w-1.5 h-1.5 animate-pulse" />
              )}
            </div>
          </div>

          {/* Center Pivot Needle */}
          <Compass className="w-3.5 h-3.5 text-ink-muted group-hover:text-ink-primary transition-colors" />
        </button>

        {/* Informative Readout (Hidden on very narrow mobile screens to avoid overlap) */}
        <div className="hidden sm:flex flex-col text-left pr-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[9px] uppercase tracking-wider text-accent-terracotta font-semibold">
              {currentPreset.time}
            </span>
            <span className="text-[10px] font-sans font-medium text-ink-primary">
              {currentPreset.name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[9px] text-ink-muted font-sans mt-0.5">
            <span>22°18&apos;N, 73°12&apos;E</span>
            {selectedFlat && (
              <>
                <span className="w-1 h-1 rounded-full bg-canvas-muted" />
                <span className="text-ink-secondary font-medium">
                  {selectedFlat.facing} Facing
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
