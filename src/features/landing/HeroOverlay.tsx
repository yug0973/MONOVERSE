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
          key="landing-hero-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          {/* Left-side dark gradient scrim behind headline and body copy for >4.5:1 contrast (Requirement 8) */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-[60%] lg:w-[50%] bg-gradient-to-r from-[#070D18]/95 via-[#070D18]/70 to-transparent pointer-events-none z-10" />

          <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 sm:p-12">
            {/* Subtle top left locator badge */}
            <div className="pt-16 sm:pt-14 pointer-events-auto">
              <span className="text-[11px] uppercase tracking-[0.25em] text-amber-300/90 font-medium bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/15 shadow-sm">
                Vadodara · Gujarat
              </span>
            </div>

            {/* Main Hero Title & Primary Action */}
            <div className="max-w-xl pb-10 sm:pb-8 pointer-events-auto">
              <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-white leading-[1.05] drop-shadow-md">
                Aarohan Residences
              </h1>

              <p className="font-serif italic text-xl sm:text-2xl text-amber-200/90 mt-2 mb-4 drop-shadow-sm">
                "{PROJECT_DATA.tagline}"
              </p>

              <p className="text-sm text-white/85 leading-relaxed max-w-md mb-6 hidden sm:block drop-shadow-xs">
                A private 14-storey residential sanctuary along the Sevasi-Bhayli green corridor. Curated 2 and 3 BHK homes designed for biophilic light and calm.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setViewMode('building')}
                  className="group inline-flex items-center gap-3 px-6 py-3 rounded bg-white text-slate-900 text-sm font-semibold hover:bg-amber-100 hover:text-slate-950 active:scale-[0.98] transition-all shadow-elevation"
                >
                  <span>Explore the residences</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Time of day lighting toggle bar */}
                <div className="flex items-center gap-1 p-1 bg-black/60 backdrop-blur-md border border-white/15 rounded shadow-soft">
                  {(['morning', 'noon', 'golden_hour', 'night'] as TimeOfDay[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeOfDay(t)}
                      title={TIME_OF_DAY_PRESETS[t].label}
                      className={`p-1.5 rounded transition-colors ${
                        customization.timeOfDay === t
                          ? 'bg-amber-400 text-slate-950 font-bold shadow-soft'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {timeIcons[t]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
