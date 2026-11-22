import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import {
  Bloom,
  EffectComposer,
  SMAA,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useAppStore } from '../../store/useAppStore';
import { TimeOfDay } from '../../types/customizer';
import { ViewMode } from '../../types/navigation';

interface PostProcessingPipelineProps {
  isMobile?: boolean;
}

interface BloomProfile {
  /** Linear-HDR luminance a pixel must exceed to bloom. Emissive windows are above 1.0, lit plaster is not. */
  threshold: number;
  intensity: number;
  radius: number;
}

/**
 * Bloom is tuned per time of day so that only genuinely emissive surfaces
 * (dusk windows, lobby glow, canopy downlights, rooftop beacon) glow.
 * Daylight stays crisp and neutral.
 */
const EXTERIOR_BLOOM: Record<TimeOfDay, BloomProfile> = {
  morning: { threshold: 1.15, intensity: 0.12, radius: 0.55 },
  noon: { threshold: 1.2, intensity: 0.1, radius: 0.5 },
  golden_hour: { threshold: 0.95, intensity: 0.6, radius: 0.72 },
  night: { threshold: 0.85, intensity: 0.85, radius: 0.78 },
};

/**
 * Inside a flat the glass-and-sky backdrop is bright, so the threshold is higher
 * and the intensity lower. Bloom only picks up LED coves and fixtures instead of
 * hazing the whole view.
 */
const INTERIOR_BLOOM: Record<TimeOfDay, BloomProfile> = {
  morning: { threshold: 1.3, intensity: 0.08, radius: 0.45 },
  noon: { threshold: 1.35, intensity: 0.06, radius: 0.45 },
  golden_hour: { threshold: 1.15, intensity: 0.22, radius: 0.55 },
  night: { threshold: 0.95, intensity: 0.45, radius: 0.6 },
};

const INTERIOR_VIEWS: ReadonlySet<ViewMode> = new Set<ViewMode>(['dollhouse', 'walkthrough', 'foyer_entry']);

/** Views that render their own full-screen imagery and bypass the composer. */
const BYPASS_VIEWS: ReadonlySet<ViewMode> = new Set<ViewMode>(['panorama']);

/**
 * Real-time graphics pipeline.
 *
 * - The HalfFloat framebuffer (the @react-three/postprocessing default) keeps emissive values above 1.0,
 *   so bloom has real HDR data to work with.
 * - ACES Filmic tone mapping runs inside the composer. While the composer is active three.js skips the
 *   renderer's own tone mapping (it only tone-maps when drawing straight to the screen), so it has to be
 *   applied here. It honours gl.toneMappingExposure, so the per-time-of-day exposure set in SceneCanvas
 *   still applies.
 * - Anti-aliasing: hardware MSAA on desktop, SMAA on mobile where multisampled targets are costly.
 * - The composer is unmounted for lite quality, panorama mode and WebGL1 contexts. three.js then falls
 *   back to its native ACES output, so the canvas can never end up blank.
 */
export const PostProcessingPipeline: React.FC<PostProcessingPipelineProps> = ({ isMobile = false }) => {
  const viewMode = useAppStore((s) => s.viewMode);
  const isLiteQuality = useAppStore((s) => s.isLiteQuality);
  const timeOfDay = useAppStore((s) => s.customization.timeOfDay);
  const isWebGL2 = useThree((s) => s.gl.capabilities.isWebGL2);

  const isInterior = INTERIOR_VIEWS.has(viewMode);
  const enabled = isWebGL2 && !isLiteQuality && !BYPASS_VIEWS.has(viewMode);

  const bloom = useMemo<BloomProfile>(() => {
    const table = isInterior ? INTERIOR_BLOOM : EXTERIOR_BLOOM;
    return table[timeOfDay] ?? table.golden_hour;
  }, [isInterior, timeOfDay]);

  if (!enabled) return null;

  const isDark = timeOfDay === 'night' || timeOfDay === 'golden_hour';
  const vignetteDarkness = isInterior ? 0.28 : isDark ? 0.5 : 0.32;
  const bloomLevels = isMobile ? 5 : 7;

  if (isMobile) {
    return (
      <EffectComposer enableNormalPass={false} multisampling={0} stencilBuffer={false}>
        <Bloom
          mipmapBlur
          luminanceThreshold={bloom.threshold}
          luminanceSmoothing={0.18}
          intensity={bloom.intensity}
          radius={bloom.radius}
          levels={bloomLevels}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Vignette offset={0.32} darkness={vignetteDarkness} />
        <SMAA />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer enableNormalPass={false} multisampling={4} stencilBuffer={false}>
      <Bloom
        mipmapBlur
        luminanceThreshold={bloom.threshold}
        luminanceSmoothing={0.18}
        intensity={bloom.intensity}
        radius={bloom.radius}
        levels={bloomLevels}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.32} darkness={vignetteDarkness} />
    </EffectComposer>
  );
};
