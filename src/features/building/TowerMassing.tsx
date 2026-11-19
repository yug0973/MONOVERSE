import React, { useEffect, useRef } from 'react';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { FloorSliceView } from './FloorSliceView';

const GLB_URL = '/models/Waterfront_18F_optimized.glb';
const PLASTER_NORMAL_URL = '/textures/pbr/plaster/Plaster001_1K-JPG_NormalGL.jpg';
const PLASTER_ROUGHNESS_URL = '/textures/pbr/plaster/Plaster001_1K-JPG_Roughness.jpg';

interface TowerMassingProps {
  // Optional props
}

/**
 * Real-Time Architectural Tower Massing & Materials Normalization
 * - Normalizes all GLB meshes to MeshStandardMaterial / MeshPhysicalMaterial
 * - Glass: transmission OFF, envMapIntensity 1.2, roughness 0.05, metalness 0.1, opacity 0.35, depthWrite false, renderOrder 10
 * - Concrete/Plaster: roughness 0.88+, subtle ambientCG normal/roughness variation
 * - Mullions/Metals: roughness 0.32, metalness 0.85, envMapIntensity 1.4
 * - Selective shadow casting & frozen static matrices
 * - Time-of-day hooks: night mode switches on window & facade glow
 */
export const TowerMassing: React.FC<TowerMassingProps> = () => {
  const {
    viewMode,
    selectedFloorNumber,
    selectFloor,
    customization,
  } = useAppStore();

  const { scene } = useGLTF(GLB_URL);

  // Load ambientCG PBR plaster textures for tactile micro-surface variation
  const [plasterNormal, plasterRoughness] = useTexture([
    PLASTER_NORMAL_URL,
    PLASTER_ROUGHNESS_URL,
  ]);

  // Configure texture repeat & anisotropy once
  useEffect(() => {
    if (plasterNormal) {
      plasterNormal.wrapS = THREE.RepeatWrapping;
      plasterNormal.wrapT = THREE.RepeatWrapping;
      plasterNormal.repeat.set(8, 8);
      plasterNormal.anisotropy = 8;
      plasterNormal.needsUpdate = true;
    }
    if (plasterRoughness) {
      plasterRoughness.wrapS = THREE.RepeatWrapping;
      plasterRoughness.wrapT = THREE.RepeatWrapping;
      plasterRoughness.repeat.set(8, 8);
      plasterRoughness.anisotropy = 8;
      plasterRoughness.needsUpdate = true;
    }
  }, [plasterNormal, plasterRoughness]);

  const isNight = customization.timeOfDay === 'night';
  const isSliced = (viewMode === 'floor_slice' || viewMode === 'dollhouse') && selectedFloorNumber !== null;

  // Cached node groups for 0ms latency state updates
  const floorNodesMapRef = useRef<Map<number, THREE.Object3D[]>>(new Map());
  const roofNodesRef = useRef<THREE.Object3D[]>([]);
  const nightMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const bollardMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const isInitializedRef = useRef<boolean>(false);

  // Initial one-time scene setup, materials audit & classification
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
          const physMat = mat as any;

          // ========================================================
          // 1. GLASS NORMALIZATION (Transmission OFF, envMapIntensity 1.2)
          // ========================================================
          if (
            name.includes('glass') ||
            matName.includes('glass') ||
            matName.includes('glazing') ||
            name.includes('balustrade') ||
            name.includes('window')
          ) {
            physMat.transmission = 0; // Transmission OFF to eliminate FBO pass
            mat.transparent = true;
            mat.opacity = 0.35;
            mat.roughness = 0.05;
            mat.metalness = 0.1;
            mat.envMapIntensity = 1.2;
            mat.depthWrite = false;
            child.renderOrder = 10;
            // Only illuminate interior window panes at night, keep balustrades as transparent safety glass
            if (!name.includes('balustrade') && !matName.includes('balustrade')) {
              nightMats.push(mat);
            }
          }
          // ========================================================
          // 2. CONCRETE / PLASTER (Roughness 0.88+, tiled PBR normal)
          // ========================================================
          else if (
            matName.includes('plaster') ||
            matName.includes('concrete') ||
            matName.includes('stucco') ||
            name.includes('wall') ||
            name.includes('slab') ||
            name.includes('column') ||
            name.includes('podium')
          ) {
            mat.roughness = 0.88;
            mat.metalness = 0.02;
            mat.envMapIntensity = 0.55;
            mat.color.set('#CCC4B8');
            if (plasterNormal) {
              mat.normalMap = plasterNormal;
              mat.normalScale = new THREE.Vector2(0.35, 0.35);
            }
            if (plasterRoughness) {
              mat.roughnessMap = plasterRoughness;
            }
          }
          // ========================================================
          // 3. MULLIONS / METALS (Roughness 0.32, metalness 0.85)
          // ========================================================
          else if (
            matName.includes('metal') ||
            matName.includes('bronze') ||
            matName.includes('mullion') ||
            name.includes('frame')
          ) {
            mat.roughness = 0.32;
            mat.metalness = 0.85;
            mat.envMapIntensity = 1.4;
          }

          // Bollards and site diffusers
          if (name.includes('bollard') || name.includes('diffuser')) {
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
  }, [scene, plasterNormal, plasterRoughness]);

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
    const glowColor = new THREE.Color(isNight ? '#FFCE85' : '#000000');
    const glowIntensity = isNight ? 0.45 : 0;
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
useTexture.preload(PLASTER_NORMAL_URL);
useTexture.preload(PLASTER_ROUGHNESS_URL);
