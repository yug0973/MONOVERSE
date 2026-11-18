import React, { useRef } from 'react';
import * as THREE from 'three';
import { Environment } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';
import { TIME_OF_DAY_PRESETS } from '../../data/customizerPalettes';

export const LightingRig: React.FC = () => {
  const { customization, isLiteQuality, viewMode } = useAppStore();
  const preset = TIME_OF_DAY_PRESETS[customization.timeOfDay] || TIME_OF_DAY_PRESETS.golden_hour;

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const isNight = customization.timeOfDay === 'night';
  const isInsideFlat = viewMode === 'dollhouse' || viewMode === 'walkthrough';

  // Normalize sun vector for visible sun billboard in sky
  const sunPos = new THREE.Vector3(...preset.sunPosition);
  const sunSkyPos = sunPos.clone().normalize().multiplyScalar(180);

  return (
    <group>
      {/* 1. Realistic HDR City Environment for Glass, Metal & Marble Reflections */}
      <Environment
        preset="city"
        environmentIntensity={isNight ? 0.15 : 0.65}
      />

      {/* 2. Atmospheric Hemisphere Fill (Cool sky zenith to warm neutral ground) */}
      <hemisphereLight
        args={[preset.skyColor, isNight ? '#0B1120' : '#8A949E', preset.ambientIntensity]}
      />

      {/* 3. Primary Directional Sunlight with Optimized 1024 Shadow Maps */}
      <directionalLight
        ref={sunRef}
        position={preset.sunPosition}
        color={preset.sunColor}
        intensity={preset.sunIntensity}
        castShadow={!isLiteQuality && viewMode !== 'walkthrough'}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={2}
        shadow-camera-far={150}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={55}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />

      {/* 4. Secondary Soft Counter-Fill */}
      <directionalLight
        position={[-preset.sunPosition[0] * 0.8, 35, -preset.sunPosition[2] * 0.8]}
        color={preset.ambientColor}
        intensity={isNight ? 0.2 : 0.45}
      />

      {/* 5. Visible Sun / Moon Disc in the Horizon */}
      {!isNight ? (
        <group position={[sunSkyPos.x, Math.max(sunSkyPos.y, 15), sunSkyPos.z]}>
          <mesh>
            <sphereGeometry args={[7.5, 24, 24]} />
            <meshBasicMaterial color="#FFF8E7" />
          </mesh>
          <mesh>
            <sphereGeometry args={[14, 18, 18]} />
            <meshBasicMaterial color="#FFB366" transparent opacity={0.25} />
          </mesh>
        </group>
      ) : (
        <group position={[-80, 75, -120]}>
          <mesh>
            <sphereGeometry args={[5.5, 24, 24]} />
            <meshBasicMaterial color="#E2EAF8" />
          </mesh>
          <pointLight color="#7FA2D6" intensity={0.4} distance={90} />
        </group>
      )}

      {/* 6. Night Architectural Landscape & Tower Uplights */}
      {isNight && (
        <group>
          <pointLight position={[0, 4, 12]} color="#FFE0B0" intensity={3.0} distance={30} decay={2} />
          <pointLight position={[15, 2, 18]} color="#FFD59E" intensity={1.5} distance={20} decay={2} />
          <pointLight position={[-15, 2, 18]} color="#FFD59E" intensity={1.5} distance={20} decay={2} />
          <pointLight position={[14, 0.4, -6]} color="#24B3D6" intensity={2.0} distance={18} decay={2} />
          <pointLight position={[0, 52, 0]} color="#FFE8C2" intensity={1.8} distance={25} decay={2} />
        </group>
      )}

      {/* 7. Interior Residence Light Bloom */}
      {preset.interiorLightsOn && !isInsideFlat && (
        <group position={[0, 24, 0]}>
          <pointLight position={[0, 0, 0]} color="#FFE6BD" intensity={2.0} distance={42} decay={2} />
          <pointLight position={[8, -8, 6]} color="#FFDFAD" intensity={1.5} distance={28} decay={2} />
          <pointLight position={[-8, 8, -6]} color="#FFDFAD" intensity={1.5} distance={28} decay={2} />
        </group>
      )}
    </group>
  );
};
