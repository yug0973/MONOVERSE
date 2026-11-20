import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { EXPERIENCE_CONFIG } from '../../config/experience.config';
import { ConceptBadge } from './ConceptBadge';
import { DebugOverlay } from './DebugOverlay';
import { ArrowRight, Compass, ShieldCheck } from 'lucide-react';

interface HeroJourneyProps {
  onExplore: () => void;
  onEnter3DApp?: () => void;
}

/**
 * Senior Architectural Front-of-Site Hero Journey (Module 2)
 * - Full-height hero_dusk concept render with subtle optical parallax
 * - Left dark gradient scrim ensuring >8:1 contrast on ivory headline and copy
 * - Cormorant Garamond serif headings, clean Inter/sans UI controls
 * - Interactive ?debug=1 calibration mode with coordinate logging
 */
export const HeroJourney: React.FC<HeroJourneyProps> = ({
  onExplore,
  onEnter3DApp,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDebug, setIsDebug] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Parallax motion tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Subtle image parallax shift (scale 1.05 to avoid border reveals)
  const bgTranslateX = useTransform(smoothX, [-0.5, 0.5], ['12px', '-12px']);
  const bgTranslateY = useTransform(smoothY, [-0.5, 0.5], ['8px', '-8px']);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsDebug(params.get('debug') === '1');

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (prefersReducedMotion) return;
    const { clientX, clientY } = e;
    const normX = clientX / window.innerWidth - 0.5;
    const normY = clientY / window.innerHeight - 0.5;
    mouseX.set(normX);
    mouseY.set(normY);
  };

  const { hero } = EXPERIENCE_CONFIG;

  return (
    <section
      ref={containerRef}
      onPointerMove={handlePointerMove}
      aria-label="Aarohan Residences Experience Hero"
      className="relative w-full h-screen min-h-[640px] overflow-hidden bg-[#070D18] select-none"
    >
      {/* 1. Full-Height Hero Dusk Concept Render with Responsive WebP */}
      <motion.div
        style={{
          x: prefersReducedMotion ? 0 : bgTranslateX,
          y: prefersReducedMotion ? 0 : bgTranslateY,
          scale: 1.05,
        }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet={hero.images.mobile}
            type="image/webp"
          />
          <img
            src={hero.images.desktop}
            alt="Aarohan Residences G+14 residential tower dusk concept render"
            className="w-full h-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </picture>
      </motion.div>

      {/* 2. Architectural Left-Side Dark Gradient Scrim (Delivers >8:1 contrast on text) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#070D18]/95 via-[#070D18]/75 to-transparent sm:w-3/5 w-full z-10"
      />
      {/* Subtle top & bottom vignette scrim */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#070D18]/60 via-transparent to-[#070D18]/80 z-10"
      />

      {/* 3. Top Architectural Branding Bar */}
      <header className="absolute top-0 inset-x-0 z-30 px-6 sm:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#B5654A] to-[#8A3F26] flex items-center justify-center shadow-lg border border-white/20">
            <Compass className="w-4 h-4 text-[#F7F3EC]" />
          </div>
          <div>
            <span className="font-serif text-lg tracking-wider text-[#F7F3EC] font-semibold block leading-tight">
              AAROHAN
            </span>
            <span className="text-[10px] tracking-[0.25em] text-[#F7F3EC]/70 uppercase font-sans block">
              Vadodara
            </span>
          </div>
        </div>

        {/* Entry Link into Existing 3D App */}
        {onEnter3DApp && (
          <button
            onClick={onEnter3DApp}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A101C]/80 hover:bg-[#0A101C] text-[#F7F3EC] text-xs font-sans border border-white/15 backdrop-blur-md transition-all hover:border-[#B5654A]/60 shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Launch 3D Explorer</span>
          </button>
        )}
      </header>

      {/* 4. Left Hero Headline, Copy & Primary Journey CTA */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center">
        <div className="max-w-xl">
          {/* Location & Heritage Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B5654A]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[#F7F3EC]/90 font-sans font-medium">
              Sevasi–Bhayli Corridor, Vadodara
            </span>
          </div>

          {/* Majestic Cormorant Garamond Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-[#F7F3EC] leading-[1.08] mb-3">
            {hero.headline}
          </h1>

          {/* Subheading in Terracotta Warmth */}
          <div className="font-serif italic text-xl sm:text-2xl text-[#E89E7D] mb-4">
            “{hero.tagline}”
          </div>

          {/* Editorial Description */}
          <p className="text-sm sm:text-base text-[#F7F3EC]/80 leading-relaxed font-sans mb-8 max-w-lg">
            {hero.description}
          </p>

          {/* Primary Journey CTA Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              onClick={onExplore}
              aria-label="Explore the residences and take the photo journey"
              className="group relative inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded bg-[#B5654A] hover:bg-[#9E533A] text-[#F7F3EC] font-sans font-medium text-sm tracking-wide shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#B5654A] focus:ring-offset-2 focus:ring-offset-[#070D18]"
            >
              <span>{hero.ctaLabel}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {onEnter3DApp && (
              <button
                onClick={onEnter3DApp}
                className="inline-flex items-center justify-center px-6 py-3.5 rounded bg-white/5 hover:bg-white/10 text-[#F7F3EC]/90 font-sans text-sm tracking-wide border border-white/15 backdrop-blur-sm transition-all"
              >
                Direct 3D Customizer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Concept Disclaimer Badge */}
      <ConceptBadge position="bottom-right" />

      {/* 6. Calibration Debug Overlay (?debug=1) */}
      {isDebug && (
        <DebugOverlay
          containerRef={containerRef}
          knownTargets={[
            {
              id: 'hero-zoom-target',
              label: 'Balcony Zoom Target',
              xPercent: hero.zoomTarget.xPercent,
              yPercent: hero.zoomTarget.yPercent,
              color: '#B5654A',
            },
          ]}
        />
      )}
    </section>
  );
};
