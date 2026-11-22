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
          {/* Subtle atmospheric vignette that keeps the building clear and pristine */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070D18]/85 via-transparent to-black/30 pointer-events-none z-10" />

          <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 sm:p-10">
            {/* Subtle top left locator badge */}
            <div className="pt-16 sm:pt-14 pointer-events-auto flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-[0.25em] text-amber-300/90 font-medium bg-black/60 backdrop-blur-md px-3 py-1.5 rounded border border-white/15 shadow-sm">
                Vadodara · Gujarat
              </span>
              <button
                onClick={() => setViewMode('building')}
                className="text-[11px] uppercase tracking-wider text-white/90 hover:text-white bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded border border-white/15 shadow-sm transition-all"
              >
                Full 3D Orbit View
              </button>
            </div>

            {/* Main Hero Title in Floating Glass Card */}
            <div className="max-w-xl pb-8 sm:pb-6 pointer-events-auto bg-black/40 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-white/15 shadow-2xl">
              <h1 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white leading-[1.05] drop-shadow-md">
                Aarohan Residences
              </h1>

              <p className="font-serif italic text-lg sm:text-xl text-amber-200/90 mt-1.5 mb-3 drop-shadow-sm">
                "{PROJECT_DATA.tagline}"
              </p>

              <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-md mb-5 hidden sm:block drop-shadow-xs">
                A private residential sanctuary along the Sevasi-Bhayli green corridor. Curated luxury residences designed for biophilic light, fluid open balconies, and quiet elegance.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setViewMode('building')}
                  className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-semibold hover:bg-amber-100 hover:text-slate-950 active:scale-[0.98] transition-all shadow-elevation"
                >
                  <span>Explore 3D Tower</span>
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
