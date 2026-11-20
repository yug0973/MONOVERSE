import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { EXPERIENCE_CONFIG } from '../../config/experience.config';
import { ConceptBadge } from './ConceptBadge';
import { DebugOverlay } from './DebugOverlay';
import { ArrowLeft } from 'lucide-react';

export type ZoomPhase = 'hero_zooming' | 'closeup_entering' | 'completed';

interface ZoomTransitionProps {
  onComplete: () => void;
  onCancel: () => void;
  isReversing?: boolean;
}

/**
 * Senior Architectural Zoom Transition Sequence (Module 3)
 * - Phase 1: 1.4s eased optical zoom of hero_dusk towards the cream balcony (x: 77%, y: 38%)
 * - Phase 2: 700ms crossfade into flat_closeup_dusk with forward camera momentum
 * - Phase 3: 700ms crossfade into the interior
 * - Respects prefers-reduced-motion (swaps to calm crossfades, eliminates zoom transforms)
 * - Fully reversible via back control
 * - Zero video elements; pure GPU-composited CSS transforms
 */
export const ZoomTransition: React.FC<ZoomTransitionProps> = ({
  onComplete,
  onCancel,
  isReversing = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<ZoomPhase>(isReversing ? 'closeup_entering' : 'hero_zooming');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDebug, setIsDebug] = useState(false);

  const { hero, flatCloseup } = EXPERIENCE_CONFIG;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsDebug(params.get('debug') === '1');

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
    }
  }, []);

  // Preload closeup and interior assets immediately on mount to prevent flash
  useEffect(() => {
    const imgCloseupDesktop = new Image();
    imgCloseupDesktop.src = flatCloseup.images.desktop;

    const imgCloseupMobile = new Image();
    imgCloseupMobile.src = flatCloseup.images.mobile;

    const imgInteriorPano = new Image();
    imgInteriorPano.src = '/assets/desktop/panorama/pano_living_sunset.webp';
  }, [flatCloseup]);

  // Orchestrate timed cinematic phase sequence
  useEffect(() => {
    if (isReversing) {
      // Reverse sequence: start at closeup, transition back to hero
      const reverseTimer = setTimeout(() => {
        setPhase('hero_zooming');
      }, 700);

      const cancelTimer = setTimeout(() => {
        onCancel();
      }, 2100);

      return () => {
        clearTimeout(reverseTimer);
        clearTimeout(cancelTimer);
      };
    }

    if (prefersReducedMotion) {
      // Reduced motion: skip 1.4s zoom, apply calm 600ms crossfade to closeup, then to interior
      const t1 = setTimeout(() => {
        setPhase('closeup_entering');
      }, 600);

      const t2 = setTimeout(() => {
        setPhase('completed');
        onComplete();
      }, 1400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    // Standard high-end cinematic timeline:
    // 0ms -> 1400ms: Hero zooms into target balcony (1.4s)
    // 1400ms -> 2100ms: Closeup crossfades in with gentle forward momentum (700ms)
    // 2100ms -> 2800ms: Interior crossfades in (700ms)
    const phase2Timer = setTimeout(() => {
      setPhase('closeup_entering');
    }, 1400);

    const completeTimer = setTimeout(() => {
      setPhase('completed');
      onComplete();
    }, 2100);

    return () => {
      clearTimeout(phase2Timer);
      clearTimeout(completeTimer);
    };
  }, [prefersReducedMotion, isReversing, onComplete, onCancel]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="Apartment Arrival Cinematic Journey"
      className="relative w-full h-screen min-h-[640px] overflow-hidden bg-[#070D18] select-none"
    >
      {/* ========================================================
          1. LAYER 1: HERO DUSK WITH 1.4s EASED BALCONY ZOOM
         ======================================================== */}
      <motion.div
        initial={{
          scale: isReversing ? hero.zoomTarget.scale : 1.0,
          opacity: 1,
        }}
        animate={{
          scale: isReversing
            ? 1.0
            : prefersReducedMotion
            ? 1.0
            : phase === 'hero_zooming'
            ? hero.zoomTarget.scale
            : hero.zoomTarget.scale * 1.15,
          opacity: phase === 'closeup_entering' ? 0 : 1,
        }}
        transition={{
          scale: {
            duration: prefersReducedMotion ? 0.6 : 1.4,
            ease: [0.25, 0.1, 0.25, 1.0], // Cinematic smooth cubic bezier
          },
          opacity: {
            duration: 0.7,
            ease: 'easeInOut',
          },
        }}
        style={{
          transformOrigin: `${hero.zoomTarget.xPercent}% ${hero.zoomTarget.yPercent}%`,
          willChange: 'transform, opacity',
        }}
        className="absolute inset-0 w-full h-full"
      >
        <picture>
          <source media="(max-width: 768px)" srcSet={hero.images.mobile} type="image/webp" />
          <img
            src={hero.images.desktop}
            alt="Aarohan Residences exterior hero view"
            className="w-full h-full object-cover object-center"
          />
        </picture>
      </motion.div>

      {/* ========================================================
          2. LAYER 2: FLAT CLOSE-UP WITH 700ms CROSSFADE
         ======================================================== */}
      <motion.div
        initial={{
          opacity: isReversing ? 1 : 0,
          scale: isReversing ? flatCloseup.zoomTarget.scale : 1.0,
        }}
        animate={{
          opacity: phase === 'closeup_entering' ? 1 : 0,
          scale: prefersReducedMotion
            ? 1.0
            : phase === 'closeup_entering'
            ? flatCloseup.zoomTarget.scale
            : 1.0,
        }}
        transition={{
          opacity: {
            duration: 0.7,
            ease: 'easeInOut',
          },
          scale: {
            duration: prefersReducedMotion ? 0.6 : 1.2,
            ease: [0.22, 0.61, 0.36, 1.0],
          },
        }}
        style={{
          transformOrigin: `${flatCloseup.zoomTarget.xPercent}% ${flatCloseup.zoomTarget.yPercent}%`,
          willChange: 'transform, opacity',
        }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <picture>
          <source media="(max-width: 768px)" srcSet={flatCloseup.images.mobile} type="image/webp" />
          <img
            src={flatCloseup.images.desktop}
            alt="Aarohan Residences residence balcony closeup"
            className="w-full h-full object-cover object-center"
          />
        </picture>
      </motion.div>

      {/* Soft Vignette Atmosphere overlay during arrival */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#070D18]/70 via-transparent to-[#070D18]/50 z-20"
      />

      {/* ========================================================
          3. REVERSIBLE BACK CONTROL & STATUS HUD
         ======================================================== */}
      <div className="absolute top-6 left-6 z-40 flex items-center gap-3">
        <button
          onClick={onCancel}
          aria-label="Return to exterior tower view"
          className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#0A101C]/80 hover:bg-[#0A101C] text-[#F7F3EC] text-xs font-sans border border-white/15 backdrop-blur-md shadow-xl transition-all hover:border-[#B5654A]"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-[#B5654A]" />
          <span>Return to Tower</span>
        </button>

        {/* Cinematic step indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] text-[#F7F3EC]/70 font-sans">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              phase === 'hero_zooming' ? 'bg-[#B5654A] animate-pulse' : 'bg-white/40'
            }`}
          />
          <span>
            {phase === 'hero_zooming'
              ? 'Approaching Residence...'
              : 'Entering Grand Salon...'}
          </span>
        </div>
      </div>

      {/* Skip to Interior Direct Control */}
      <div className="absolute top-6 right-6 sm:top-auto sm:bottom-6 sm:left-6 z-40">
        <button
          onClick={onComplete}
          aria-label="Skip arrival animation and enter residence immediately"
          className="text-[11px] text-[#F7F3EC]/70 hover:text-[#F7F3EC] uppercase tracking-wider font-sans underline underline-offset-4 transition-colors bg-[#0A101C]/60 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-full sm:rounded-none backdrop-blur-sm sm:backdrop-blur-none border border-white/10 sm:border-none"
        >
          Skip to Interior →
        </button>
      </div>

      {/* Required Concept Disclaimer */}
      <ConceptBadge position="bottom-right" />

      {/* Calibration Overlay in Debug Mode (?debug=1) */}
      {isDebug && (
        <DebugOverlay
          containerRef={containerRef}
          knownTargets={[
            {
              id: 'hero-zoom-target',
              label: 'Hero Balcony Target',
              xPercent: hero.zoomTarget.xPercent,
              yPercent: hero.zoomTarget.yPercent,
              color: '#B5654A',
            },
            {
              id: 'closeup-target',
              label: 'Interior Entry Target',
              xPercent: flatCloseup.zoomTarget.xPercent,
              yPercent: flatCloseup.zoomTarget.yPercent,
              color: '#4ADE80',
            },
          ]}
        />
      )}
    </div>
  );
};
