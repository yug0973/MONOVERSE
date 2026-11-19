import React, { useRef } from 'react';
import * as THREE from 'three';
import { Environment } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';
import { TIME_OF_DAY_PRESETS } from '../../data/customizerPalettes';

const HDRI_URL = '/textures/environment/golden_hour_1k.hdr';

/**
 * Senior Architectural Lighting & Solar Azimuth Rig
 * - Preloaded Poly Haven Golden Hour HDRI (<2MB local file) powering scene.environment & background
 * - Balanced PBR lighting hierarchy avoiding overexposed facades
 * - Sun direction physically matched to HDRI solar vector with 2048 PCFSoft shadow maps
 * - Tight shadow frustum fitted to the 18F tower (eliminates peter-panning & shadow acne)
 * - Time-of-day hooks: Morning, Noon, Golden Hour, and Night with warm facade & balcony lighting
 */
export const LightingRig: React.FC = () => {
  const { customization, isLiteQuality, viewMode } = useAppStore();
  const preset = TIME_OF_DAY_PRESETS[customization.timeOfDay] || TIME_OF_DAY_PRESETS.golden_hour;

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const isNight = customization.timeOfDay === 'night';
  const isInsideFlat = viewMode === 'dollhouse' || viewMode === 'walkthrough';

  // Environment HDR intensity tuned for balanced ACESFilmic exposure
  const envIntensity = isNight
    ? 0.12
    : customization.timeOfDay === 'noon'
    ? 0.76
    : customization.timeOfDay === 'morning'
    ? 0.62
    : 0.65; // golden_hour

  // In golden hour, sun vector aligns with Poly Haven HDRI warm horizon beam
  const sunPosition: [number, number, number] =
    customization.timeOfDay === 'golden_hour'
      ? [-44, 20, 26]
      : customization.timeOfDay === 'morning'
      ? [42, 26, -26]
      : customization.timeOfDay === 'noon'
      ? [12, 65, 8]
      : [-28, 42, -26]; // night cool moonlight

  const sunIntensity = isNight
    ? 0.12
    : customization.timeOfDay === 'noon'
    ? 2.1
    : customization.timeOfDay === 'morning'
    ? 1.65
    : 1.75; // golden_hour

  return (
    <group>
      {/* 1. Poly Haven Golden Hour HDRI (<2MB CC0 preloaded local file) for PBR Reflections & Sky Background */}
      <Environment
        files={HDRI_URL}
        background={!isInsideFlat}
        environmentIntensity={envIntensity}
      />

      {/* 2. Atmospheric Hemisphere Fill (Cool sky zenith to warm ground reflection) */}
      <hemisphereLight
        args={[
          isNight ? '#162238' : preset.skyColor,
          isNight ? '#0B111A' : '#6A6660',
          isNight ? 0.2 : 0.35,
        ]}
      />

      {/* 3. Primary Directional Sunlight with 2048 PCFSoft Shadows tightly fitted to Tower */}
      <directionalLight
        ref={sunRef}
        position={sunPosition}
        color={preset.sunColor}
        intensity={sunIntensity}
        castShadow={!isLiteQuality && viewMode !== 'walkthrough'}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={8}
        shadow-camera-far={120}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={72}
        shadow-camera-bottom={-4}
        shadow-bias={-0.00012}
        shadow-normalBias={0.022}
      />

      {/* 4. Soft Skylight Counter-Fill (prevents crushed pitch-black shadow crevices) */}
      <directionalLight
        position={[-sunPosition[0] * 0.75, 40, -sunPosition[2] * 0.75]}
        color={isNight ? '#20324D' : preset.ambientColor}
        intensity={isNight ? 0.1 : 0.18}
      />

      {/* 5. Night Architectural Facade Uplights, Portal Diffusers & Balcony Accent Lights */}
      {isNight && (
        <group>
          {/* Main Entrance Fluted Portal Uplights */}
          <pointLight position={[0, 4.5, 12]} color="#FFE0B0" intensity={2.8} distance={26} decay={2} />
          <pointLight position={[15, 2.5, 18]} color="#FFD59E" intensity={1.6} distance={20} decay={2} />
          <pointLight position={[-15, 2.5, 18]} color="#FFD59E" intensity={1.6} distance={20} decay={2} />
          {/* Swimming Pool Deep Blue Water Luminescence */}
          <pointLight position={[14, 0.3, -6]} color="#20B4E0" intensity={2.0} distance={18} decay={2} />
          {/* Rooftop Amenity Crown Architectural Wash */}
          <pointLight position={[0, 56, 0]} color="#FFE8C2" intensity={1.8} distance={24} decay={2} />
        </group>
      )}

      {/* 6. Interior Window & Balcony Glow visible during Golden Hour and Night from Tower Exterior */}
      {preset.interiorLightsOn && !isInsideFlat && (
        <group position={[0, 28, 0]}>
          <pointLight position={[0, 0, 0]} color="#FFE6BD" intensity={1.8} distance={42} decay={2} />
          <pointLight position={[7, -10, 5]} color="#FFDFAD" intensity={1.4} distance={28} decay={2} />
          <pointLight position={[-7, 10, -5]} color="#FFDFAD" intensity={1.4} distance={28} decay={2} />
          <pointLight position={[0, -20, 4]} color="#FFE0B0" intensity={1.2} distance={24} decay={2} />
        </group>
      )}
    </group>
  );
};
