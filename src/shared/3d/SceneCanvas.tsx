import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { TIME_OF_DAY_PRESETS } from '../../data/customizerPalettes';
import { BasePlate } from './BasePlate';
import { LightingRig } from './LightingRig';
import { CameraRig } from './CameraRig';
import { TowerMassing } from '../../features/building/TowerMassing';
import { DollhouseView } from '../../features/flat/DollhouseView';
import { SceneLoader } from '../../features/landing/SceneLoader';

/** Sky Hemisphere Dome for rich realistic sky zenith gradient */
const SkyDome: React.FC<{ skyColor: string }> = ({ skyColor }) => {
  return (
    <mesh position={[0, 0, 0]} renderOrder={-1}>
      <sphereGeometry args={[220, 24, 18]} />
      <meshBasicMaterial
        color={skyColor}
        side={THREE.BackSide}
        fog={false}
      />
    </mesh>
  );
};

export const SceneCanvas: React.FC = () => {
  const { customization, isLiteQuality, viewMode } = useAppStore();
  const preset = TIME_OF_DAY_PRESETS[customization.timeOfDay] || TIME_OF_DAY_PRESETS.golden_hour;
  const isNight = customization.timeOfDay === 'night';

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const isInsideFlat = viewMode === 'dollhouse' || viewMode === 'walkthrough';

  // Optimized DPR: max 1.35 on desktop, 1.15 on mobile (razor-sharp text/edges, cuts fill-rate load by 55%)
  const targetDpr = isLiteQuality ? 1 : isMobile ? 1.15 : 1.35;

  return (
    <div className="relative w-full h-full bg-canvas-light overflow-hidden">
      <Canvas
        shadows={!isLiteQuality}
        gl={{
          antialias: !isLiteQuality,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isNight ? 0.95 : 1.02,
        }}
        camera={{
          position: [46, 26, 52],
          fov: 40,
          near: 0.2,
          far: 350,
        }}
        dpr={targetDpr}
      >
        {/* Background color based on dynamic sky preset */}
        <color attach="background" args={[preset.skyColor]} />
        <fog
          attach="fog"
          args={[preset.skyColor, isInsideFlat ? 95 : 85, isInsideFlat ? 320 : 260]}
        />

        <SkyDome skyColor={preset.skyColor} />

        <Suspense fallback={null}>
          <LightingRig />
          <BasePlate />
          <TowerMassing />
          <DollhouseView />
          <CameraRig />
        </Suspense>
      </Canvas>

      {/* Real compilation progress indicator */}
      <SceneLoader />
    </div>
  );
};
