import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const BasePlate: React.FC = () => {
  const { viewMode } = useAppStore();

  // Hide baseplate when inside a flat
  if (viewMode === 'dollhouse' || viewMode === 'walkthrough') {
    return null;
  }

  return (
    <group position={[0, -0.02, 0]}>
      {/* 1. Expansive Deep Water Body (Waterfront Harbour / River) */}
      <mesh receiveShadow position={[0, -0.08, -60]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[450, 220]} />
        <meshStandardMaterial
          color="#1E394D"
          roughness={0.12}
          metalness={0.5}
        />
      </mesh>

      {/* 2. Distant Horizon Shore / Coastal Land */}
      <mesh receiveShadow position={[0, -0.12, 80]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[450, 180]} />
        <meshStandardMaterial
          color="#525B63"
          roughness={0.9}
        />
      </mesh>
    </group>
  );
};
