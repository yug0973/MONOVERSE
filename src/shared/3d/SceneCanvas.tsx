import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { BasePlate } from './BasePlate';
import { LightingRig } from './LightingRig';
import { CameraRig } from './CameraRig';
import { TowerMassing } from '../../features/building/TowerMassing';
import { DollhouseView } from '../../features/flat/DollhouseView';
import { PanoramaSphere } from '../../features/panorama/PanoramaSphere';
import { PostProcessingPipeline } from './PostProcessingPipeline';
import { SceneLoader } from '../../features/landing/SceneLoader';
import { TimeOfDay } from '../../types/customizer';

/**
 * Tone-mapping exposure per time of day. Interior values are lower for sunset: the sky fills a whole wall of
 * glass, and at the exterior exposure it washes the room out.
 */
const EXPOSURE_EXTERIOR: Record<TimeOfDay, number> = {
  morning: 1.05,
  noon: 1.0,
  golden_hour: 0.96,
  night: 0.85,
};

const EXPOSURE_INTERIOR: Record<TimeOfDay, number> = {
  morning: 1.0,
  noon: 0.95,
  golden_hour: 0.82,
  night: 1.0,
};

/** Applies exposure imperatively, so it is honoured by both the composer's tone mapping and the native fallback. */
const ExposureController: React.FC<{ exposure: number }> = ({ exposure }) => {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.toneMappingExposure = exposure;
  }, [gl, exposure]);
  return null;
};

const RendererMetricsHook: React.FC = () => {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__THREE_RENDERER__ = gl;
      (window as any).__THREE_SCENE__ = scene;
      (window as any).__THREE_CAMERA__ = camera;
      (window as any).THREE = THREE;
    }
  }, [gl, scene, camera]);
  return null;
};

export const SceneCanvas: React.FC = () => {
  const { customization, isLiteQuality, viewMode } = useAppStore();
  const isNight = customization.timeOfDay === 'night';
  const isInsideFlat =
    viewMode === 'dollhouse' ||
    viewMode === 'walkthrough' ||
    viewMode === 'panorama' ||
    viewMode === 'foyer_entry';

  const exposure = (isInsideFlat ? EXPOSURE_INTERIOR : EXPOSURE_EXTERIOR)[customization.timeOfDay];

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Clamped device pixel ratio for smooth performance (1.35 on desktop, 1.15 on mobile)
  const targetDpr = isLiteQuality ? 1 : isMobile ? 1.15 : 1.35;

  // Horizon color for atmospheric exponential fog matched to dusk HDRI horizon
  const horizonFogColor = isNight
    ? '#080E18'
    : customization.timeOfDay === 'noon'
    ? '#8EBFEE'
    : customization.timeOfDay === 'morning'
    ? '#A8C9E6'
    : '#0E1726'; // Blue-hour dusk deep twilight horizon

  // Exponential fog density (soft atmospheric horizon fade, seamless ground blend)
  const fogDensity = isInsideFlat ? 0.0018 : 0.0034;

  return (
    <div className="relative w-full h-full bg-canvas-light overflow-hidden">
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{
          antialias: false, // Antialiasing handled via post-processing SMAA (avoids MSAA composer conflict)
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          localClippingEnabled: true,
        }}
        camera={{
          position: [40, 20.0, 56],
          fov: 30, // 35mm-equivalent FOV (28-32 per requirement)
          near: 0.2,
          far: 750,
        }}
        dpr={targetDpr}
      >
        {/* In dollhouse cutaway, present against clean warm architectural studio background */}
        {viewMode === 'dollhouse' && <color attach="background" args={['#F0EBE3']} />}

        {/* Exponential atmospheric fog tinted to the HDRI horizon (soft architectural depth fade) */}
        {!isInsideFlat && <fogExp2 attach="fog" args={[horizonFogColor, fogDensity]} />}

        <Suspense fallback={null}>
          <RendererMetricsHook />
          <ExposureController exposure={exposure} />
          {viewMode !== 'panorama' && <LightingRig />}
          {!isInsideFlat && <BasePlate />}
          {!isInsideFlat && <TowerMassing />}
          {(viewMode === 'dollhouse' || viewMode === 'walkthrough' || viewMode === 'foyer_entry') && <DollhouseView />}
          <PanoramaSphere />
          <CameraRig />
          <PostProcessingPipeline isMobile={isMobile} />
        </Suspense>
      </Canvas>

      {/* Real compilation & asset loading indicator */}
      <SceneLoader />
    </div>
  );
};
