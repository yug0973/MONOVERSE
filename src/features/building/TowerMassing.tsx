import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { FloorSliceView } from './FloorSliceView';

const GLB_URL = '/models/Waterfront_18F_optimized.glb';

interface TowerMassingProps {
  // Optional props
}

export const TowerMassing: React.FC<TowerMassingProps> = () => {
  const {
    viewMode,
    selectedFloorNumber,
    selectFloor,
    customization,
  } = useAppStore();

  const { scene } = useGLTF(GLB_URL);

  const isNight = customization.timeOfDay === 'night';
  const isSliced = (viewMode === 'floor_slice' || viewMode === 'dollhouse') && selectedFloorNumber !== null;

  // Cached node groups for 0ms latency state updates
  const floorNodesMapRef = useRef<Map<number, THREE.Object3D[]>>(new Map());
  const roofNodesRef = useRef<THREE.Object3D[]>([]);
  const nightMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const bollardMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const isInitializedRef = useRef<boolean>(false);

  // Initial one-time scene setup & classification
  useEffect(() => {
    if (!scene) return;

    const floorMap = new Map<number, THREE.Object3D[]>();
    for (let f = 1; f <= 18; f++) {
      floorMap.set(f, []);
    }
    const roofNodes: THREE.Object3D[] = [];
    const nightMats: THREE.MeshStandardMaterial[] = [];
    const bollardMats: THREE.MeshStandardMaterial[] = [];

    scene.traverse((child: any) => {
      // Freeze static matrices for thousands of nodes (massive CPU gain)
      child.matrixAutoUpdate = false;
      child.updateMatrix();

      if (child.isMesh) {
        const name = (child.name || '').toLowerCase();
        const mat = child.material as THREE.MeshStandardMaterial;
        const matName = (mat?.name || '').toLowerCase();

        // Optimized selective shadows: only structure and primary facade slabs cast shadows
        const isNonShadow =
          name.includes('glass') ||
          name.includes('glazing') ||
          name.includes('curtain') ||
          name.includes('water') ||
          name.includes('bollard') ||
          name.includes('distant') ||
          name.includes('pool') ||
          name.includes('pier') ||
          matName.includes('glass') ||
          matName.includes('glazing');

        child.castShadow = !isNonShadow;
        child.receiveShadow = !name.includes('distant');

        if (mat) {
          // Transmission bypass with high-performance alpha transparency
          const physMat = mat as any;
          if (physMat.transmission && physMat.transmission > 0) {
            physMat.transmission = 0;
            mat.transparent = true;
            mat.opacity = 0.35;
            mat.roughness = 0.08;
            mat.metalness = 0.1;
            mat.depthWrite = false;
          }

          if (
            matName.includes('clear architectural glass') ||
            matName.includes('glazing') ||
            name.includes('glass') ||
            name.includes('curtain')
          ) {
            nightMats.push(mat);
          } else if (name.includes('bollard') || name.includes('diffuser')) {
            bollardMats.push(mat);
          }
        }
      }

      if (child.name) {
        const match = child.name.match(/(?:Level|Balcony|Curtain|Floor|Apartment)\s*(\d+)/i);
        if (match) {
          const floorNum = parseInt(match[1], 10);
          if (floorNum >= 1 && floorNum <= 18) {
            floorMap.get(floorNum)?.push(child);
          }
        } else if (child.name.includes('Roof') || child.name.includes('Rooftop')) {
          roofNodes.push(child);
        }
      }
    });

    floorNodesMapRef.current = floorMap;
    roofNodesRef.current = roofNodes;
    nightMaterialsRef.current = nightMats;
    bollardMaterialsRef.current = bollardMats;
    isInitializedRef.current = true;
  }, [scene]);

  // Instant floor slicing update (0ms latency, no full scene traversal)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const targetFloor = selectedFloorNumber || 1;

    for (let f = 1; f <= 18; f++) {
      const isVisible = !isSliced || f <= targetFloor;
      const nodes = floorNodesMapRef.current.get(f) || [];
      for (const node of nodes) {
        node.visible = isVisible;
      }
    }

    const showRoof = !isSliced;
    for (const node of roofNodesRef.current) {
      node.visible = showRoof;
    }
  }, [isSliced, selectedFloorNumber]);

  // Instant night lighting update (0ms latency)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const glowColor = new THREE.Color(isNight ? '#FF9E33' : '#000000');
    const glowIntensity = isNight ? 1.6 : 0;
    for (const mat of nightMaterialsRef.current) {
      mat.emissive = glowColor;
      mat.emissiveIntensity = glowIntensity;
    }

    const bollardColor = new THREE.Color(isNight ? '#FFE2B8' : '#000000');
    const bollardIntensity = isNight ? 2.5 : 0;
    for (const mat of bollardMaterialsRef.current) {
      mat.emissive = bollardColor;
      mat.emissiveIntensity = bollardIntensity;
    }
  }, [isNight]);

  // When inside a flat (dollhouse or walkthrough), hide exterior tower
  if (viewMode === 'dollhouse' || viewMode === 'walkthrough') {
    return null;
  }

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Waterfront 18F Architectural Tower Model */}
      <primitive
        object={scene}
        onClick={(e: any) => {
          e.stopPropagation();
          if (viewMode === 'building') {
            selectFloor(selectedFloorNumber || 9);
          }
        }}
      />

      {/* Sliced Floor Interactive Cutaway Plan */}
      {isSliced && selectedFloorNumber && (
        <FloorSliceView floorNumber={selectedFloorNumber} />
      )}
    </group>
  );
};

useGLTF.preload(GLB_URL);
