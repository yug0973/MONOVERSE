import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';
import { TIME_OF_DAY_PRESETS } from '../../data/customizerPalettes';

const GENERATED_SKY_URL = '/textures/environment/pano_vadodara_dusk_sky_360_v1.png';

/**
 * Senior Architectural Lighting & Blue-Hour Dusk Rig (Module 2)
 * - Seamless 2:1 Equirectangular Dusk Sky (Vadodara twilight) as scene.background & scene.environment
 * - Warm directional sun light matched to the dusk horizon amber azimuth (245°, low altitude)
 * - 2048 PCFSoft shadow maps with tight frustum fitted to G+14 residential superstructure
 * - Tuned bias/normalBias to eliminate shadow acne and peter-panning
 * - Architectural warm base uplights, entrance canopy wash, and crown glow
 */
export const LightingRig: React.FC = () => {
  const { customization, isLiteQuality, viewMode, debugMode } = useAppStore();
  const { scene } = useThree();
  const preset = TIME_OF_DAY_PRESETS[customization.timeOfDay] || TIME_OF_DAY_PRESETS.golden_hour;

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const isNight = customization.timeOfDay === 'night';
  const isInsideFlat = viewMode === 'dollhouse' || viewMode === 'walkthrough';

  // Load generated seamless 2:1 equirectangular dusk sky
  const skyTexture = useTexture(GENERATED_SKY_URL);

  useEffect(() => {
    if (!skyTexture) return;
    skyTexture.mapping = THREE.EquirectangularReflectionMapping;
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    skyTexture.needsUpdate = true;

    if (!isInsideFlat) {
      scene.environment = skyTexture;
      // In clay mode, keep subtle neutral sky reflection; in textured mode, use full sky
      scene.background = debugMode === 'clay' ? new THREE.Color('#E8E3DA') : skyTexture;
    }

    return () => {
      // Clean cleanup
    };
  }, [skyTexture, scene, isInsideFlat, debugMode]);

  // Solar vector matched to dusk horizon warm beam (low angle casting dramatic elongated shadows)
  const sunPosition: [number, number, number] =
    customization.timeOfDay === 'golden_hour'
      ? [-46, 14, 28] // Low dusk amber beam
      : customization.timeOfDay === 'morning'
      ? [42, 26, -26]
      : customization.timeOfDay === 'noon'
      ? [12, 65, 8]
      : [-28, 42, -26]; // Night cool moonlight

  const sunColor =
    customization.timeOfDay === 'golden_hour'
      ? '#FF9C50' // Warm golden-amber dusk beam
      : isNight
      ? '#5078A8'
      : preset.sunColor;

  const sunIntensity = isNight
    ? 0.45
    : customization.timeOfDay === 'noon'
    ? 2.1
    : customization.timeOfDay === 'morning'
    ? 1.65
    : 1.55; // Golden hour / dusk hero

  return (
    <group>
      {/* 1. Atmospheric Hemisphere Fill (Deep twilight blue zenith to warm earth ground reflection) */}
      <hemisphereLight
        args={[
          isNight ? '#101B2E' : '#1C2E4C',
          isNight ? '#0A0F18' : '#2A221A',
          isNight ? 0.32 : 0.48,
        ]}
      />

      {/* 2. Primary Directional Sunlight with 2048 PCFSoft Shadows tightly fitted to Tower */}
      <directionalLight
        ref={sunRef}
        position={sunPosition}
        color={sunColor}
        intensity={sunIntensity}
        castShadow={!isLiteQuality && viewMode !== 'walkthrough'}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={4}
        shadow-camera-far={135}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={75}
        shadow-camera-bottom={-4}
        shadow-bias={-0.00012}
        shadow-normalBias={0.02}
      />

      {/* 3. Soft Twilight Counter-Fill (prevents pitch-black shadow crevices) */}
      <directionalLight
        position={[-sunPosition[0] * 0.75, 35, -sunPosition[2] * 0.75]}
        color={isNight ? '#1E3252' : '#284065'}
        intensity={isNight ? 0.22 : 0.32}
      />

      {/* 4. Architectural Base Uplights, Entrance Portal, Canopy & Crown Lighting */}
      {!isInsideFlat && (
        <group>
          {/* Main Entrance Grand Canopy & Fluted Lobby Uplights */}
          <pointLight position={[0, 4.6, 11.2]} color="#FFE0A4" intensity={3.8} distance={26} decay={2} />
          <pointLight position={[-8.5, 3.2, 11.5]} color="#FFD590" intensity={2.4} distance={18} decay={2} />
          <pointLight position={[8.5, 3.2, 11.5]} color="#FFD590" intensity={2.4} distance={18} decay={2} />

          {/* Lateral Base Fluted Uplighting */}
          <pointLight position={[-13.5, 2.5, 0]} color="#FFE5B0" intensity={2.0} distance={16} decay={2} />
          <pointLight position={[13.5, 2.5, 0]} color="#FFE5B0" intensity={2.0} distance={16} decay={2} />

          {/* Rooftop Crown & Pergola Architectural Contour Warm Wash */}
          <pointLight position={[0, 52.0, 0]} color="#FFE8B5" intensity={2.8} distance={30} decay={2} />
        </group>
      )}
    </group>
  );
};

useTexture.preload(GENERATED_SKY_URL);
