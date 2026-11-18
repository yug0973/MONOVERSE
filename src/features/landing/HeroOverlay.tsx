import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TIME_OF_DAY_PRESETS } from '../../data/customizerPalettes';
import { TimeOfDay } from '../../types/customizer';
import { PROJECT_DATA } from '../../data/projectData';
import { ArrowRight, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HeroOverlay: React.FC = () => {
  const { viewMode, setViewMode, customization, setTimeOfDay } = useAppStore();

  const isLanding = viewMode === 'landing';

  const timeIcons: Record<TimeOfDay, React.ReactNode> = {
    morning: <Sunrise className="w-3.5 h-3.5" />,
    noon: <Sun className="w-3.5 h-3.5" />,
    golden_hour: <Sunset className="w-3.5 h-3.5" />,
    night: <Moon className="w-3.5 h-3.5" />,
  };

  return (
    <AnimatePresence>
      {isLanding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 sm:p-12"
        >
          {/* Subtle top left locator */}
          <div className="pt-16 sm:pt-14 pointer-events-auto">
            <span className="text-[11px] uppercase tracking-[0.25em] text-accent-brass font-medium bg-canvas/80 backdrop-blur-sm px-2.5 py-1 rounded border border-canvas-muted/60">
              Vadodara · Gujarat
            </span>
          </div>

          {/* Main Hero Title & Single Primary Action */}
          <div className="max-w-xl pb-10 sm:pb-8 pointer-events-auto">
            <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-ink-primary leading-[1.05] drop-shadow-xs">
              Aarohan Residences
            </h1>

            <p className="font-serif italic text-xl sm:text-2xl text-ink-secondary mt-2 mb-4">
              "{PROJECT_DATA.tagline}"
            </p>

            <p className="text-sm text-ink-secondary/90 leading-relaxed max-w-md mb-6 hidden sm:block">
              A private 14-storey residential sanctuary along the Sevasi-Bhayli green corridor. Curated 2 and 3 BHK homes designed for biophilic light and calm.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setViewMode('building')}
                className="group inline-flex items-center gap-3 px-6 py-3 rounded bg-ink-primary text-canvas text-sm font-medium hover:bg-ink-secondary active:scale-[0.98] transition-all shadow-elevation"
              >
                <span>Explore the residences</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Time of day lighting toggle bar */}
              <div className="flex items-center gap-1 p-1 bg-canvas/80 backdrop-blur-md border border-canvas-muted rounded shadow-soft">
                {(['morning', 'noon', 'golden_hour', 'night'] as TimeOfDay[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeOfDay(t)}
                    title={TIME_OF_DAY_PRESETS[t].label}
                    className={`p-1.5 rounded transition-colors ${
                      customization.timeOfDay === t
                        ? 'bg-ink-primary text-canvas shadow-soft'
                        : 'text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle'
                    }`}
                  >
                    {timeIcons[t]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
