import React from 'react';
import { FacingDirection } from '../../types/building';
import { useAppStore } from '../../store/useAppStore';
import { TIME_OF_DAY_PRESETS } from '../../data/customizerPalettes';

interface BalconyViewProps {
  facing: FacingDirection;
}

export const BalconyView: React.FC<BalconyViewProps> = ({ facing }) => {
  const { customization } = useAppStore();
  const preset = TIME_OF_DAY_PRESETS[customization.timeOfDay] || TIME_OF_DAY_PRESETS.golden_hour;

  const isEast = facing === 'EAST';

  return (
    <group position={[0, 0, 5.6]}>
      {/* Balcony Cantilever Teak Decking Slab */}
      <mesh position={[0, -0.05, 1.4]} receiveShadow>
        <boxGeometry args={[5.2, 0.1, 2.8]} />
        <meshStandardMaterial color="#8E6746" roughness={0.65} />
      </mesh>

      {/* Modern Glass Balustrade Guardrail (Height 1.1m) */}
      {/* Front Glazing */}
      <mesh position={[0, 0.55, 2.78]}>
        <boxGeometry args={[5.1, 1.1, 0.04]} />
        <meshStandardMaterial
          color="#8BAAB8"
          roughness={0.15}
          metalness={0.2}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Left Return Glazing */}
      <mesh position={[-2.58, 0.55, 1.4]}>
        <boxGeometry args={[0.04, 1.1, 2.76]} />
        <meshStandardMaterial
          color="#8BAAB8"
          roughness={0.15}
          metalness={0.2}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Right Return Glazing */}
      <mesh position={[2.58, 0.55, 1.4]}>
        <boxGeometry args={[0.04, 1.1, 2.76]} />
        <meshStandardMaterial
          color="#8BAAB8"
          roughness={0.15}
          metalness={0.2}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Bronze Top Handrail */}
      <mesh position={[0, 1.12, 2.78]} castShadow>
        <boxGeometry args={[5.22, 0.04, 0.06]} />
        <meshStandardMaterial color="#9E7D47" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Distant Horizon Silhouette Panel matching Facing */}
      <group position={[0, -2, 60]}>
        {/* Distant Vadodara Green Corridor / City Skyline Backdrop */}
        <mesh position={[0, 8, 0]}>
          <planeGeometry args={[120, 36]} />
          <meshBasicMaterial
            color={
              preset.id === 'night'
                ? '#0A0E18'
                : preset.id === 'golden_hour'
                ? '#E59468'
                : preset.id === 'morning'
                ? '#B8D5E5'
                : '#A2C6E2'
            }
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Tree & Skyline Silhouette Layer */}
        {[-40, -20, 0, 20, 40].map((x, i) => (
          <mesh key={i} position={[x + (isEast ? 4 : -4), -2, 1]}>
            <boxGeometry args={[18, 12 + Math.sin(i * 1.5) * 4, 1]} />
            <meshBasicMaterial
              color={
                preset.id === 'night'
                  ? '#060810'
                  : preset.id === 'golden_hour'
                  ? '#6A4535'
                  : '#4A6258'
              }
              transparent
              opacity={0.75}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
