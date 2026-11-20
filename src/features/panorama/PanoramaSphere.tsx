import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { EXPERIENCE_CONFIG, TimeOfDayVariant } from '../../config/experience.config';
import { PanoramaHotspots } from './PanoramaHotspots';

/**
 * Senior Architectural Panorama Sphere (Module 4)
 * - Equirectangular 360 sphere enclosing camera inside the SAME Three.js canvas.
 * - Inverted normals (scale [-1, 1, 1] / BackSide) with high-fidelity texture filtering.
 * - Dynamic variant loading (Sunset / Day / Night) for Living room salon.
 * - Renders 3D hotspots for Living, Balcony, Dining, and Kitchen.
 */
export const PanoramaSphere: React.FC = () => {
  const { viewMode, selectedLightingVariant, isDissolvingWarmMask } = useAppStore();
  const { camera } = useThree();
  const sphereRef = useRef<THREE.Mesh>(null);

  const isVisible = viewMode === 'panorama' || (viewMode === 'flat_flyin' && isDissolvingWarmMask);

  // Asset paths based on variant and resolution
  const livingRoomConfig = useMemo(() => {
    return EXPERIENCE_CONFIG.rooms.find((r) => r.id === 'living');
  }, []);

  const variant: TimeOfDayVariant = selectedLightingVariant || 'sunset';
  const desktopSrc =
    livingRoomConfig?.sources[variant]?.desktop ||
    '/assets/desktop/panorama/pano_living_sunset.webp';

  const texture = useTexture(desktopSrc);

  useMemo(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
    }
  }, [texture]);

  // Keep sphere locked around camera position so panning creates pure angular look
  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.position.copy(camera.position);
    }
  });

  if (!isVisible) return null;

  return (
    <group name="panorama-interior-stage">
      {/* 360 Inverted Equirectangular Living Panorama Sphere */}
      <mesh
        ref={sphereRef}
        scale={[-1, 1, 1]}
        rotation={[0, 0, 0]}
        renderOrder={1}
      >
        <sphereGeometry args={[50, 64, 32]} />
        <meshBasicMaterial
          map={texture}
          side={THREE.BackSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Interactive 3D Hotspots in Panorama Space */}
      {viewMode === 'panorama' && <PanoramaHotspots />}
    </group>
  );
};
