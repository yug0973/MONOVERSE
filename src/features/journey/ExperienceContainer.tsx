import React, { useState } from 'react';
import { HeroJourney } from './HeroJourney';
import { useAppStore } from '../../store/useAppStore';

export type JourneyStage = 'hero' | 'zoom' | 'interior';

interface ExperienceContainerProps {
  onEnter3DApp: () => void;
}

/**
 * Top-Level Orchestrator for the Image Journey Experience
 * Hosts the Hero, Zoom Transition (Module 3), and Interior Viewer (Modules 4-7)
 */
export const ExperienceContainer: React.FC<ExperienceContainerProps> = ({
  onEnter3DApp,
}) => {
  const [stage, setStage] = useState<JourneyStage>('hero');
  const { selectFlat } = useAppStore();

  const handleExplore = () => {
    // In Module 2, log transition readiness; Module 3 will implement eased zoom sequence
    console.log('[Journey] Entering zoom transition sequence towards target flat');
    setStage('zoom');
  };

  const handleBackToHero = () => {
    setStage('hero');
  };

  const handleLaunch3DCustomizer = () => {
    // Select default flat-9a and enter dollhouse customizer mode
    selectFlat('flat-9a');
    onEnter3DApp();
  };

  return (
    <div className="relative w-full min-h-screen bg-[#070D18] text-[#F7F3EC] overflow-hidden">
      {stage === 'hero' && (
        <HeroJourney
          onExplore={handleExplore}
          onEnter3DApp={handleLaunch3DCustomizer}
        />
      )}

      {stage === 'zoom' && (
        <div className="relative w-full h-screen flex flex-col items-center justify-center bg-[#070D18] p-6 text-center select-none">
          <div className="max-w-md p-8 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <span className="text-xs uppercase tracking-[0.2em] text-[#B5654A] font-medium block mb-2">
              Module 2 Verification State
            </span>
            <h2 className="font-serif text-3xl font-medium text-[#F7F3EC] mb-3">
              Balcony Target Calibrated
            </h2>
            <p className="text-sm text-[#F7F3EC]/80 mb-6 leading-relaxed">
              Target coordinate locked at <span className="font-mono text-[#E89E7D]">x: 77.0%, y: 38.0%</span>.
              Ready for Module 3 (eased 1.4s zoom, 700ms closeup crossfade, 700ms interior transition).
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleBackToHero}
                className="px-5 py-2.5 rounded bg-white/10 hover:bg-white/15 text-[#F7F3EC] text-xs uppercase tracking-wider font-sans border border-white/10 transition-all"
              >
                Back to Hero
              </button>
              <button
                onClick={handleLaunch3DCustomizer}
                className="px-5 py-2.5 rounded bg-[#B5654A] hover:bg-[#9E533A] text-white text-xs uppercase tracking-wider font-sans shadow-lg transition-all"
              >
                Open 3D Customizer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
