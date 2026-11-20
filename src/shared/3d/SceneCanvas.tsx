import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { BasePlate } from './BasePlate';
import { LightingRig } from './LightingRig';
import { CameraRig } from './CameraRig';
import { TowerMassing } from '../../features/building/TowerMassing';
import { DollhouseView } from '../../features/flat/DollhouseView';
import { PostProcessingPipeline } from './PostProcessingPipeline';
import { SceneLoader } from '../../features/landing/SceneLoader';

const RendererMetricsHook: React.FC = () => {
  const { gl } = useThree();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__THREE_RENDERER__ = gl;
    }
  }, [gl]);
  return null;
};

export const SceneCanvas: React.FC = () => {
  const { customization, isLiteQuality, viewMode } = useAppStore();
  const isNight = customization.timeOfDay === 'night';
  const isInsideFlat = viewMode === 'dollhouse' || viewMode === 'walkthrough';

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
          toneMappingExposure: isNight ? 0.88 : 0.92,
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
          <LightingRig />
          <BasePlate />
          <TowerMassing />
          <DollhouseView />
          <CameraRig />
          <PostProcessingPipeline isMobile={isMobile} />
        </Suspense>
      </Canvas>

      {/* Real compilation & asset loading indicator */}
      <SceneLoader />
    </div>
  );
};
