import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { EXPERIENCE_CONFIG } from '../../config/experience.config';
import { formatINR } from '../../lib/utils';
import {
  ArrowLeft,
  Compass,
  Palette,
  Sun,
  Sunset,
  Moon,
  Info,
  Sparkles,
  Utensils,
  Coffee,
  Sofa,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Senior Architectural Panorama & Still Room HUD (Module 4 & 5)
 * - Renders top navigational return bar, sample residence disclaimer badge,
 *   concept render notice, room switcher tabs, and Design Studio handoff button.
 * - Dynamic lighting slider displaying ONLY authentic available variants per room
 *   (Living: Day/Sunset/Night; Bedroom: Sunset/Night; Kitchen: Day/Sunset; Balcony: Sunset).
 * - Houses the 800ms eased warm mask dissolve overlay.
 */
export const PanoramaHUD: React.FC = () => {
  const {
    viewMode,
    selectedFloorNumber,
    selectedFlatId,
    activeRoomId,
    selectedLightingVariant,
    setLightingVariant,
    switchTourRoom,
    returnToFloor,
    selectFlat,
    isDissolvingWarmMask,
  } = useAppStore();

  const isVisible = viewMode === 'panorama';
  const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;
  const isFeatured = selectedFlatId === 'flat-12-A' || flat?.code === '121';

  const currentRoomId = activeRoomId || 'living';
  const currentRoom = useMemo(() => {
    return EXPERIENCE_CONFIG.rooms.find((r) => r.id === currentRoomId) || EXPERIENCE_CONFIG.rooms[0];
  }, [currentRoomId]);

  const availableVariants = currentRoom.availableVariants;

  return (
    <>
      {/* ======================================================== */}
      {/* 1. 800ms EASED WARM MASK DISSOLVE OVERLAY (Module 4 Spec) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isDissolvingWarmMask && (
          <motion.div
            key="warm-dissolve-mask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-radial-warm"
            style={{
              background:
                'radial-gradient(circle at center, rgba(255, 184, 112, 0.96) 0%, rgba(200, 90, 50, 0.88) 55%, rgba(10, 14, 23, 0.96) 100%)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1.05, opacity: 1 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="text-center text-white select-none px-6"
            >
              <div className="font-serif text-2xl md:text-3xl font-light tracking-wide drop-shadow-md">
                Entering Living Salon
              </div>
              <div className="text-xs uppercase tracking-widest text-amber-200/90 mt-1 font-mono">
                {flat ? `Unit ${flat.unitNumber} · Floor ${flat.floorNumber}` : 'Residence 360°'}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 2. PANORAMA & STILL ROOM INTERACTION HUD                 */}
      {/* ======================================================== */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-6 overflow-hidden"
        >
          {/* Top Navigational Header */}
          <div className="flex items-start justify-between gap-4">
            {/* Left: Back button & Residence Breadcrumbs */}
            <div className="flex flex-col gap-2 pointer-events-auto">
              <button
                onClick={returnToFloor}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-canvas-light/95 hover:bg-white text-ink-primary border border-canvas-muted shadow-elevation backdrop-blur-md transition-all active:scale-95 group"
                title="Return to floor view"
              >
                <ArrowLeft className="w-4 h-4 text-accent-terracotta group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-xs font-medium">
                  Back to Floor {selectedFloorNumber || 12}
                </span>
              </button>

              {/* Residence Identification Card */}
              <div className="bg-canvas-light/95 backdrop-blur-md border border-canvas-muted rounded-xl p-3 shadow-elevation max-w-sm">
                <div className="flex items-center gap-2 mb-1">
                  {isFeatured ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-accent-terracotta text-white shadow-soft">
                      Featured Residence
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-600 text-white shadow-soft">
                      Sample residence
                    </span>
                  )}
                  <span className="text-xs font-serif font-medium text-ink-primary">
                    {flat ? `Unit ${flat.unitNumber} (#${flat.code})` : 'Residence'}
                  </span>
                </div>

                <h2 className="font-serif text-base sm:text-lg font-medium text-ink-primary">
                  {currentRoom.title}
                </h2>

                {flat && (
                  <div className="flex items-center gap-3 text-xs text-ink-secondary mt-1 pt-1.5 border-t border-canvas-muted/60">
                    <span className="font-medium text-ink-primary">{flat.carpetAreaSqFt} sq ft carpet</span>
                    <span>·</span>
                    <span>Facing {flat.facing}</span>
                    <span>·</span>
                    <strong className="font-serif text-ink-primary font-semibold">
                      {formatINR(flat.totalPrice)}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Concept Render Notice & Design Studio Handoff */}
            <div className="flex flex-col items-end gap-2.5 pointer-events-auto">
              {/* Concept Notice */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas-light/90 border border-canvas-muted text-[10px] text-ink-muted backdrop-blur-md shadow-soft">
                <Info className="w-3 h-3 text-accent-brass" />
                <span>{EXPERIENCE_CONFIG.conceptNoticeText}</span>
              </div>

              {/* Design Studio 3D Customizer Handoff Button (Module 6) */}
              {flat && (
                <button
                  onClick={() => selectFlat(flat.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-terracotta hover:bg-[#A35238] text-white shadow-elevation backdrop-blur-md transition-all active:scale-95 group font-medium text-xs"
                  title="Open Architectural Design Studio customizer"
                >
                  <Palette className="w-4 h-4 text-white/90 group-hover:rotate-12 transition-transform" />
                  <span>Design Studio</span>
                </button>
              )}
            </div>
          </div>

          {/* Center-Top: Architectural Room Switcher Tabs (Module 5) */}
          <div className="self-center pointer-events-auto max-w-[calc(100vw-24px)] overflow-x-auto no-scrollbar">
            <div className="bg-canvas-light/95 backdrop-blur-md border border-canvas-muted rounded-full p-1 shadow-elevation flex items-center gap-1 whitespace-nowrap">
              {EXPERIENCE_CONFIG.rooms.map((room) => {
                const isActive = room.id === currentRoomId;
                return (
                  <button
                    key={room.id}
                    onClick={() => switchTourRoom(room.id)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-accent-terracotta text-white shadow-soft font-semibold'
                        : 'text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle'
                    }`}
                    title={`View ${room.title}`}
                  >
                    {room.id === 'living' && <Sofa className="w-3.5 h-3.5" />}
                    {room.id === 'bedroom' && <Sparkles className="w-3.5 h-3.5" />}
                    {room.id === 'kitchen' && <Utensils className="w-3.5 h-3.5" />}
                    {room.id === 'balcony' && <Coffee className="w-3.5 h-3.5" />}
                    <span>{room.shortLabel}</span>
                    {room.type === 'panorama' && (
                      <span className="hidden sm:inline text-[9px] opacity-75 font-mono">360°</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Dock: Room Mode Hint & Strictly Filtered Lighting Slider */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto">
            {/* View Direction & Interaction Hint */}
            <div className="px-3.5 py-1.5 rounded-full bg-canvas-light/90 border border-canvas-muted text-[11px] text-ink-secondary backdrop-blur-md shadow-soft flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-accent-terracotta" />
              <span>
                {currentRoom.type === 'panorama'
                  ? 'Drag or swipe to explore 360° · Seam protected'
                  : currentRoom.id === 'kitchen'
                  ? 'Architectural Framing · 1.06× Zoom'
                  : currentRoom.id === 'bedroom'
                  ? 'Master Bedroom · Calibrated alignment'
                  : 'Skyline Balcony · Sunset terrace'}
              </span>
            </div>

            {/* Lighting Slider: Displays ONLY variants that exist for current room (Module 5 Spec) */}
            <div className="bg-canvas-light/95 backdrop-blur-md border border-canvas-muted rounded-full p-1 shadow-elevation flex items-center gap-1">
              {/* Day Variant */}
              {availableVariants.includes('day') && (
                <button
                  onClick={() => setLightingVariant('day')}
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedLightingVariant === 'day'
                      ? 'bg-amber-500 text-white shadow-soft font-semibold'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle'
                  }`}
                  title="Daylight exposure"
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Day</span>
                </button>
              )}

              {/* Sunset Variant */}
              {availableVariants.includes('sunset') && (
                <button
                  onClick={() => setLightingVariant('sunset')}
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedLightingVariant === 'sunset'
                      ? 'bg-accent-terracotta text-white shadow-soft font-semibold'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle'
                  }`}
                  title="Golden hour sunset"
                >
                  <Sunset className="w-3.5 h-3.5" />
                  <span>Sunset</span>
                </button>
              )}

              {/* Night Variant */}
              {availableVariants.includes('night') && (
                <button
                  onClick={() => setLightingVariant('night')}
                  className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedLightingVariant === 'night'
                      ? 'bg-[#1E293B] text-white shadow-soft font-semibold'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle'
                  }`}
                  title="Twilight night ambient"
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Night</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};
