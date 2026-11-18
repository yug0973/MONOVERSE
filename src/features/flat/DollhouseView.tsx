import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { RoomLabel3D } from './RoomLabel3D';
import { RoomHotspot } from '../walkthrough/RoomHotspot';
import { WALL_PALETTES } from '../../data/customizerPalettes';

const GLB_URL = '/models/Interior_asset_optimized.glb';

export const DollhouseView: React.FC = () => {
  const {
    viewMode,
    selectedFlatId,
    customization,
  } = useAppStore();

  // 1. Unconditionally load GLB asset at top level
  const { scene } = useGLTF(GLB_URL);

  const isFlatView = viewMode === 'dollhouse' || viewMode === 'walkthrough';
  const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;

  const activePalette = WALL_PALETTES.find((p) => p.id === customization.globalWallColor);
  const activeWallColorHex = activePalette?.hex || '#F5F2EB';
  const flooring = customization.flooring;
  const furniturePkg = customization.furniturePackage;

  // Cached node groups for zero-latency customizer updates
  const wallMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const floorMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const decorativeMeshesRef = useRef<THREE.Object3D[]>([]);
  const essentialMeshesRef = useRef<THREE.Object3D[]>([]);
  const ceilingMeshesRef = useRef<THREE.Object3D[]>([]);
  const isInitializedRef = useRef<boolean>(false);

  // Initial one-time scene setup & classification of meshes
  useEffect(() => {
    if (!scene) return;

    const walls: THREE.MeshStandardMaterial[] = [];
    const floors: THREE.MeshStandardMaterial[] = [];
    const decor: THREE.Object3D[] = [];
    const essential: THREE.Object3D[] = [];
    const ceilings: THREE.Object3D[] = [];

    scene.traverse((child: any) => {
      if (child.isMesh) {
        const name = (child.name || '').toLowerCase();
        const mat = child.material;
        const matName = (mat?.name || '').toLowerCase();

        // Highly optimized selective shadow casting:
        // Only structural elements and major furniture cast shadows.
        // Micro-poly accessories, foliage, tableware, nightstands, and decor never cast shadows.
        const isShadowCaster =
          name.includes('wall') ||
          name.includes('floor') ||
          name.includes('slab') ||
          name.includes('column') ||
          name.includes('door') ||
          name.includes('sofa') ||
          name.includes('bed') ||
          name.includes('dining table') ||
          name.includes('island') ||
          name.includes('wardrobe') ||
          name.includes('cabinet');

        const isExcludedFromShadow =
          !isShadowCaster ||
          name.includes('drink table') ||
          name.includes('side table') ||
          name.includes('nightstand') ||
          name.includes('chair') ||
          name.includes('branch') ||
          name.includes('vase') ||
          name.includes('decor') ||
          name.includes('bottle') ||
          name.includes('cutting board') ||
          name.includes('canister') ||
          name.includes('fern') ||
          name.includes('palm') ||
          name.includes('plant') ||
          name.includes('glass') ||
          name.includes('curtain') ||
          name.includes('daybed') ||
          name.includes('pendant') ||
          name.includes('chandelier') ||
          matName.includes('glass');

        child.castShadow = !isExcludedFromShadow;
        child.receiveShadow = true;

        if (mat) {
          // Bypass heavy KHR transmission FBO pass with high-performance alpha transparency
          if (mat.transmission && mat.transmission > 0) {
            mat.transmission = 0;
            mat.transparent = true;
            mat.opacity = 0.35;
            mat.roughness = 0.08;
            mat.metalness = 0.1;
            mat.depthWrite = false;
          }

          if (
            (matName.includes('warm ivory plaster') || matName.includes('plaster')) &&
            !matName.includes('cutaway') &&
            !matName.includes('ceiling')
          ) {
            walls.push(mat);
          }
          if (
            matName.includes('travertine') ||
            matName.includes('floor')
          ) {
            floors.push(mat);
          }
        }
      }

      if (child.name) {
        const name = child.name.toLowerCase();

        if (
          name.includes('ceiling') ||
          name.includes('fascia') ||
          name.includes('roof') ||
          name.includes('complete')
        ) {
          ceilings.push(child);
        } else if (
          name.includes('vase') ||
          name.includes('plant') ||
          name.includes('tree') ||
          name.includes('decor') ||
          name.includes('books') ||
          name.includes('candle') ||
          name.includes('centerpiece') ||
          name.includes('sculpture') ||
          name.includes('chandelier') ||
          name.includes('rug') ||
          name.includes('tray') ||
          name.includes('branch') ||
          name.includes('bottle') ||
          name.includes('cutting board') ||
          name.includes('canister') ||
          name.includes('fern') ||
          name.includes('pot_big') ||
          name.includes('pedestal') ||
          name.includes('hydrangea') ||
          name.includes('tableware') ||
          name.includes('accessories')
        ) {
          decor.push(child);
        } else if (
          name.includes('sofa') ||
          name.includes('dining table') ||
          name.includes('dining chair') ||
          name.includes('bed') ||
          name.includes('coffee table') ||
          name.includes('nightstand') ||
          name.includes('armchair') ||
          name.includes('daybed') ||
          name.includes('side table') ||
          name.includes('wardrobe')
        ) {
          essential.push(child);
        }
      }
    });

    wallMaterialsRef.current = walls;
    floorMaterialsRef.current = floors;
    decorativeMeshesRef.current = decor;
    essentialMeshesRef.current = essential;
    ceilingMeshesRef.current = ceilings;
    isInitializedRef.current = true;
  }, [scene]);

  // Instant wall color update (0ms latency, no scene traversal)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const color = new THREE.Color(activeWallColorHex);
    for (const mat of wallMaterialsRef.current) {
      mat.color = color;
    }
  }, [activeWallColorHex]);

  // Instant flooring update (0ms latency)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    for (const mat of floorMaterialsRef.current) {
      if (flooring === 'light_marble') {
        mat.roughness = 0.18;
        mat.metalness = 0.12;
      } else if (flooring === 'warm_oak') {
        mat.roughness = 0.45;
        mat.metalness = 0.05;
      } else if (flooring === 'herringbone') {
        mat.roughness = 0.4;
        mat.metalness = 0.05;
      } else if (flooring === 'dark_slate') {
        mat.roughness = 0.65;
        mat.metalness = 0.1;
      }
    }
  }, [flooring]);

  // Instant ceiling visibility toggle based on viewMode
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const hideCeilings = viewMode === 'dollhouse';
    for (const node of ceilingMeshesRef.current) {
      node.visible = !hideCeilings;
    }
  }, [viewMode]);

  // Instant furniture package swap
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const showDecor = furniturePkg === 'premium';
    const showEssential = furniturePkg === 'essential' || furniturePkg === 'premium';

    for (const node of decorativeMeshesRef.current) {
      node.visible = showDecor;
    }
    for (const node of essentialMeshesRef.current) {
      node.visible = showEssential;
    }
  }, [furniturePkg]);

  // 3. Early exit only after all hooks are called
  if (!isFlatView || !flat) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* Real Interior Asset GLB Model */}
      <primitive object={scene} />

      {/* Optimized Interior Ambient Lighting */}
      <pointLight position={[7.15, 2.8, -6.74]} color="#FFF5E5" intensity={1.6} distance={18} decay={2} />
      <pointLight position={[-7.01, 2.8, -6.93]} color="#FFF5E5" intensity={1.4} distance={16} decay={2} />

      {/* 3D Floating Room Labels in Dollhouse View */}
      {viewMode === 'dollhouse' &&
        flat.rooms.map((room) => (
          <RoomLabel3D key={`label-${room.id}`} room={room} />
        ))}

      {/* Click-to-Move Room Navigation Hotspots in Walkthrough View */}
      {viewMode === 'walkthrough' &&
        flat.rooms.map((room) => (
          <RoomHotspot key={`hotspot-${room.id}`} room={room} />
        ))}
    </group>
  );
};

useGLTF.preload(GLB_URL);
