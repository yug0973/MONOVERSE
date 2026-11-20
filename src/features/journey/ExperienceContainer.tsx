import React, { useState } from 'react';
import { HeroJourney } from './HeroJourney';
import { ZoomTransition } from './ZoomTransition';
import { ConceptBadge } from './ConceptBadge';
import { useAppStore } from '../../store/useAppStore';
import { ArrowLeft, Sliders } from 'lucide-react';

export type JourneyStage = 'hero' | 'zoom' | 'interior';

interface ExperienceContainerProps {
  onEnter3DApp: () => void;
}

/**
 * Top-Level Orchestrator for the Image Journey Experience
 * - Stage 1: Hero concept render with subtle parallax and CTA
 * - Stage 2: Eased 1.4s optical zoom -> 700ms closeup -> 700ms interior crossfade
 * - Stage 3: Interior Sanctuary View with reversible back control and 3D customizer handoff
 */
export const ExperienceContainer: React.FC<ExperienceContainerProps> = ({
  onEnter3DApp,
}) => {
  const [stage, setStage] = useState<JourneyStage>('hero');
  const [isReversing, setIsReversing] = useState<boolean>(false);
  const { selectFlat } = useAppStore();

  const handleStartExplore = () => {
    setIsReversing(false);
    setStage('zoom');
  };

  const handleZoomComplete = () => {
    setStage('interior');
  };

  const handleBackToHero = () => {
    setIsReversing(true);
    setStage('zoom');
  };

  const handleCancelZoom = () => {
    setIsReversing(false);
    setStage('hero');
  };

  const handleLaunch3DCustomizer = () => {
    selectFlat('flat-9a');
    onEnter3DApp();
  };

  return (
    <div className="relative w-full min-h-screen bg-[#070D18] text-[#F7F3EC] overflow-hidden">
      {/* 1. Hero Journey View */}
      {stage === 'hero' && (
        <HeroJourney
          onExplore={handleStartExplore}
          onEnter3DApp={handleLaunch3DCustomizer}
        />
      )}

      {/* 2. Eased Zoom Transition Sequence (Module 3) */}
      {stage === 'zoom' && (
        <ZoomTransition
          onComplete={handleZoomComplete}
          onCancel={handleCancelZoom}
          isReversing={isReversing}
        />
      )}

      {/* 3. Interior Stage (Prepared for Module 4 Panorama Viewer) */}
      {stage === 'interior' && (
        <div className="relative w-full h-screen overflow-hidden bg-[#070D18] select-none">
          {/* Background Preview Image: Living Sunset Panorama */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src="/assets/desktop/panorama/pano_living_sunset.webp"
              alt="Aarohan Residences interior grand salon sunset view"
              className="w-full h-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#070D18]/85 via-transparent to-[#070D18]/60"
            />
          </div>

          {/* Top Navigation & Reversible Back Control */}
          <header className="absolute top-0 inset-x-0 z-30 px-6 sm:px-12 py-6 flex items-center justify-between">
            <button
              onClick={handleBackToHero}
              aria-label="Return to exterior tower view"
              className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0A101C]/80 hover:bg-[#0A101C] text-[#F7F3EC] text-xs font-sans border border-white/15 backdrop-blur-md shadow-xl transition-all hover:border-[#B5654A]"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-[#B5654A]" />
              <span className="font-medium">Exterior View</span>
            </button>

            {/* Direct 3D Customizer Handoff */}
            <button
              onClick={handleLaunch3DCustomizer}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#B5654A] hover:bg-[#9E533A] text-white text-xs font-sans shadow-lg transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize This Residence</span>
            </button>
          </header>

          {/* Centered Arrival Headline / HUD Card */}
          <div className="absolute inset-x-6 bottom-16 sm:bottom-20 z-20 flex justify-center">
            <div className="max-w-xl w-full p-6 sm:p-8 rounded-xl bg-[#0A101C]/80 backdrop-blur-xl border border-white/15 shadow-2xl text-center">
              <span className="text-xs uppercase tracking-[0.25em] text-[#B5654A] font-sans font-medium block mb-2">
                Grand Salon & Terrace Arrival
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl text-[#F7F3EC] font-medium mb-3">
                Welcome to Unit 9A
              </h2>
              <p className="text-xs sm:text-sm text-[#F7F3EC]/80 leading-relaxed font-sans mb-6">
                Dual-aspect living salon with seamless floor-to-ceiling glass leading to the sunset sundeck balcony.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleBackToHero}
                  className="px-5 py-2.5 rounded bg-white/10 hover:bg-white/15 text-[#F7F3EC] text-xs font-sans border border-white/10 transition-all"
                >
                  Reverse Zoom to Tower
                </button>
                <button
                  onClick={handleLaunch3DCustomizer}
                  className="px-5 py-2.5 rounded bg-[#B5654A] hover:bg-[#9E533A] text-white text-xs font-sans shadow-lg transition-all"
                >
                  Launch 3D Customizer
                </button>
              </div>
            </div>
          </div>

          {/* Required Concept Disclaimer */}
          <ConceptBadge position="bottom-right" />
        </div>
      )}
    </div>
  );
};
