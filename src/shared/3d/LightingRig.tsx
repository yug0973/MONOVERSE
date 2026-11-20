import React, { useRef } from 'react';
import * as THREE from 'three';
import { Environment } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';
import { TIME_OF_DAY_PRESETS } from '../../data/customizerPalettes';

const HDRI_DUSK_URL = '/textures/environment/dusk_sky_1k.hdr';

/**
 * Senior Architectural Lighting & Blue-Hour Dusk Rig
 * - Poly Haven Pure Sky Dusk HDRI (<2MB local file) powering scene.environment & background
 * - Deep blue sky transitioning to warm amber at horizon
 * - Physically matched low-angle solar vector with 2048 PCFSoft shadow maps
 * - Tight shadow frustum fitted to G+14 residential superstructure
 * - Tower architectural lighting: lit lobby, fluted base uplighting, balcony accents, lit crown wash
 */
export const LightingRig: React.FC = () => {
  const { customization, isLiteQuality, viewMode } = useAppStore();
  const preset = TIME_OF_DAY_PRESETS[customization.timeOfDay] || TIME_OF_DAY_PRESETS.golden_hour;

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const isNight = customization.timeOfDay === 'night';
  const isInsideFlat = viewMode === 'dollhouse' || viewMode === 'walkthrough';

  // Environment HDR intensity tuned for saturated blue-hour exposure without neon blowout
  const envIntensity = isNight
    ? 0.22
    : customization.timeOfDay === 'noon'
    ? 0.78
    : customization.timeOfDay === 'morning'
    ? 0.68
    : 1.05; // golden_hour / dusk hero (saturated blue-hour sky without blowout)

  // Solar vector matched to dusk horizon warm beam
  const sunPosition: [number, number, number] =
    customization.timeOfDay === 'golden_hour'
      ? [-46, 14, 28] // Low dusk angle casting elongated dramatic shadows
      : customization.timeOfDay === 'morning'
      ? [42, 26, -26]
      : customization.timeOfDay === 'noon'
      ? [12, 65, 8]
      : [-28, 42, -26]; // Night cool moonlight

  const sunColor =
    customization.timeOfDay === 'golden_hour'
      ? '#FF9C50' // Warm amber dusk beam
      : isNight
      ? '#5078A8'
      : preset.sunColor;

  const sunIntensity = isNight
    ? 0.45
    : customization.timeOfDay === 'noon'
    ? 2.1
    : customization.timeOfDay === 'morning'
    ? 1.65
    : 1.45; // Golden hour / dusk

  return (
    <group>
      {/* 1. Poly Haven Pure Sky Dusk HDRI for PBR Reflections & Sky Background */}
      <Environment
        files={HDRI_DUSK_URL}
        background={!isInsideFlat}
        environmentIntensity={envIntensity}
      />

      {/* 2. Atmospheric Hemisphere Fill (Deep twilight blue zenith to warm earth ground reflection) */}
      <hemisphereLight
        args={[
          isNight ? '#101B2E' : '#182B48',
          isNight ? '#0A0F18' : '#2A241E',
          isNight ? 0.28 : 0.42,
        ]}
      />

      {/* 3. Primary Directional Sunlight with 2048 PCFSoft Shadows tightly fitted to Tower */}
      <directionalLight
        ref={sunRef}
        position={sunPosition}
        color={sunColor}
        intensity={sunIntensity}
        castShadow={!isLiteQuality && viewMode !== 'walkthrough'}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={6}
        shadow-camera-far={130}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={75}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />

      {/* 4. Soft Twilight Counter-Fill (prevents crushed pitch-black shadow crevices) */}
      <directionalLight
        position={[-sunPosition[0] * 0.75, 35, -sunPosition[2] * 0.75]}
        color={isNight ? '#1E3252' : '#243A5E'}
        intensity={isNight ? 0.18 : 0.28}
      />

      {/* 5. Architectural Base Uplights, Entrance Portal, Pool & Crown Lighting */}
      {!isInsideFlat && (
        <group>
          {/* Main Entrance Grand Canopy & Fluted Lobby Uplights */}
          <pointLight position={[0, 5.0, 10.5]} color="#FFE0A4" intensity={3.4} distance={24} decay={2} />
          <pointLight position={[-8.5, 3.2, 11.5]} color="#FFD590" intensity={2.2} distance={18} decay={2} />
          <pointLight position={[8.5, 3.2, 11.5]} color="#FFD590" intensity={2.2} distance={18} decay={2} />

          {/* Double-Height Lobby Interior Radiance glowing through Glass Curtain Wall */}
          <pointLight position={[0, 3.2, 5.5]} color="#FFE5B5" intensity={4.2} distance={22} decay={2} />
          <pointLight position={[0, 0.8, 6.2]} color="#FFD080" intensity={2.4} distance={14} decay={2} />

          {/* Driveway Arrival Portal & Security Gate Illumination */}
          <pointLight position={[0, 2.4, 15.0]} color="#FFDFAC" intensity={1.8} distance={16} decay={2} />
          <pointLight position={[15.2, 3.2, 12.0]} color="#FFE2B8" intensity={1.6} distance={14} decay={2} />

          {/* Swimming Pool Deep Blue Luminescence */}
          <pointLight position={[0, 0.4, -20]} color="#14A8D0" intensity={2.8} distance={22} decay={2} />

          {/* Rooftop Amenity Crown Architectural Wash */}
          <pointLight position={[0, 54.0, 0]} color="#FFE8C0" intensity={2.6} distance={26} decay={2} />
          <pointLight position={[-8.0, 54.5, 0]} color="#FFD895" intensity={1.8} distance={20} decay={2} />
          <pointLight position={[7.8, 54.0, 0]} color="#FFD895" intensity={1.8} distance={20} decay={2} />
        </group>
      )}

      {/* 6. Subtle Mid-Rise Ambient Accent Wash for Atmospheric Depth */}
      {!isInsideFlat && (
        <group position={[0, 28, 0]}>
          <pointLight position={[0, 0, 9]} color="#FFE6BD" intensity={1.2} distance={32} decay={2} />
          <pointLight position={[0, 0, -9]} color="#FFE6BD" intensity={1.2} distance={32} decay={2} />
        </group>
      )}
    </group>
  );
};
