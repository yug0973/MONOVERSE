import React from 'react';
import { EffectComposer, Bloom, SMAA, N8AO, Vignette } from '@react-three/postprocessing';
import { useAppStore } from '../../store/useAppStore';

interface PostProcessingPipelineProps {
  isMobile?: boolean;
}

/**
 * Senior Real-Time Graphics Post-Processing Pipeline
 * - Single EffectComposer pass with multisampling=0 to avoid MSAA/Composer conflicts
 * - SMAA morphological antialiasing for razor-sharp geometric edges
 * - N8AO Screen Space Ambient Occlusion for natural contact occlusion without dark halos
 * - High-threshold Bloom (0.94) ensuring ONLY light diffusers and emissive sources bloom, never concrete walls
 * - Subtle Vignette for cinematic optical framing (no chromatic aberration, no heavy DOF)
 */
export const PostProcessingPipeline: React.FC<PostProcessingPipelineProps> = ({ isMobile = false }) => {
  const { isLiteQuality } = useAppStore();

  // If user explicitly enabled lite mode, skip postprocessing entirely
  if (isLiteQuality) {
    return null;
  }

  const effects = [
    <SMAA key="smaa" />,
    <N8AO
      key="n8ao"
      aoRadius={1.0}
      distanceFalloff={2.2}
      intensity={0.85}
      quality={isMobile ? 'performance' : 'medium'}
      halfRes={true}
      color="#0A1018"
    />,
    <Bloom
      key="bloom"
      luminanceThreshold={0.94}
      luminanceSmoothing={0.12}
      intensity={0.22}
      mipmapBlur={true}
    />,
    <Vignette
      key="vignette"
      offset={0.35}
      darkness={0.32}
      eskil={false}
    />,
  ];

  return (
    <EffectComposer
      multisampling={0}
      stencilBuffer={false}
      children={effects as any}
    />
  );
};
