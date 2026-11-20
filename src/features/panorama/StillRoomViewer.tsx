import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { EXPERIENCE_CONFIG, TimeOfDayVariant } from '../../config/experience.config';
import { ArrowLeft, Sparkles, Coffee, Utensils } from 'lucide-react';

/**
 * Senior Architectural Still Room Viewer (Module 5)
 * - Renders photoreal 16:9 still architectural captures for Master Bedroom, Kitchen, and Balcony.
 * - Kitchen: Enforces fixed 1.06 zoom (clipping ~5% stretched filler border).
 * - Bedroom: Applies per-image transform config (scale, x, y offset alignment).
 * - Smooth 500ms opacity crossfade between authentic lighting variants.
 * - Interactive hotspot overlays to return to the 360 Living Salon.
 */
export const StillRoomViewer: React.FC = () => {
  const {
    viewMode,
    activeRoomId,
    selectedLightingVariant,
    switchTourRoom,
  } = useAppStore();

  const isVisible = viewMode === 'panorama' && activeRoomId && activeRoomId !== 'living';

  const roomConfig = useMemo(() => {
    return EXPERIENCE_CONFIG.rooms.find((r) => r.id === activeRoomId);
  }, [activeRoomId]);

  if (!isVisible || !roomConfig || roomConfig.type !== 'still') {
    return null;
  }

  // Active lighting variant (guaranteed valid for this room)
  const variant: TimeOfDayVariant =
    selectedLightingVariant && roomConfig.availableVariants.includes(selectedLightingVariant)
      ? selectedLightingVariant
      : roomConfig.defaultVariant;

  const imageSrc =
    roomConfig.sources[variant]?.desktop ||
    roomConfig.sources[roomConfig.defaultVariant]?.desktop ||
    '';

  // Per-image transform alignment (scale, x, y)
  // Kitchen uses fixed 1.06 scale; Bedroom uses calibrated per-variant shift
  const transform = roomConfig.transforms?.[variant] || { scale: 1.0, x: 0, y: 0 };

  return (
    <div
      data-testid="still-room-viewer"
      className="absolute inset-0 z-20 overflow-hidden bg-black flex items-center justify-center select-none"
    >
      {/* 500ms Eased Crossfade Layer */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={`${activeRoomId}-${variant}-${imageSrc}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
        >
          <img
            src={imageSrc}
            alt={`${roomConfig.title} - ${variant}`}
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-500 ease-out"
            style={{
              transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px)`,
              transformOrigin: 'center center',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Floating Architectural Return Hotspots (e.g. Return to Living) */}
      {roomConfig.hotspots && roomConfig.hotspots.length > 0 && (
        <div className="absolute inset-0 pointer-events-none z-25">
          {roomConfig.hotspots.map((hs) => (
            <motion.div
              key={hs.id}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              style={{
                position: 'absolute',
                left: `${hs.xPercent}%`,
                top: `${hs.yPercent}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="pointer-events-auto"
            >
              <button
                onClick={() => switchTourRoom(hs.targetRoomId || 'living')}
                className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-canvas-light/95 hover:bg-white text-ink-primary backdrop-blur-md border border-accent-terracotta/40 hover:border-accent-terracotta shadow-elevation transition-all active:scale-95 cursor-pointer select-none"
                title={`Navigate to ${hs.label}`}
              >
                <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-accent-terracotta text-white shadow-[0_0_12px_#C85A32]">
                  <span className="absolute inset-0 rounded-full bg-accent-terracotta animate-ping opacity-35" />
                  {hs.targetRoomId === 'living' ? (
                    <ArrowLeft className="w-3.5 h-3.5" />
                  ) : hs.targetRoomId === 'balcony' ? (
                    <Coffee className="w-3.5 h-3.5" />
                  ) : hs.targetRoomId === 'kitchen' ? (
                    <Utensils className="w-3.5 h-3.5" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="text-left pr-1">
                  <div className="text-xs font-serif font-semibold text-ink-primary leading-tight group-hover:text-accent-terracotta transition-colors">
                    {hs.label}
                  </div>
                  <div className="text-[9px] text-ink-muted font-sans leading-none">
                    360° Interior Tour
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
