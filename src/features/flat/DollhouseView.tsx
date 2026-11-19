import React, { useEffect, useRef } from 'react';
import { useGLTF, useTexture, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { RoomLabel3D } from './RoomLabel3D';
import { RoomHotspot } from '../walkthrough/RoomHotspot';
import { WALL_PALETTES } from '../../data/customizerPalettes';
import { getProceduralFloorTexture } from '../../lib/proceduralTextures';

const GLB_URL = '/models/Interior_asset_optimized.glb';
const PLASTER_NORMAL_URL = '/textures/pbr/plaster/Plaster001_1K-JPG_NormalGL.jpg';

/**
 * Senior Architectural Flat & Interior Walkthrough Rig
 * - Material audit: glass normalized (transmission 0, envMapIntensity 1.2, roughness 0.05, depthWrite false)
 * - Walls: subtle ambientCG plaster normal relief with dynamic palette response
 * - Floors: 2K procedural PBR textures (Banswara Marble, European Oak, Kund Slate, Chevron Herringbone)
 * - Ceilings: matte architectural ivory with 0ms cutaway toggle
 * - Contact shadows for grounded furniture & partition walls (zero fake dark blobs)
 */
export const DollhouseView: React.FC = () => {
  const {
    viewMode,
    selectedFlatId,
    customization,
    isLiteQuality,
  } = useAppStore();

  const { scene } = useGLTF(GLB_URL);
  const plasterNormal = useTexture(PLASTER_NORMAL_URL);

  useEffect(() => {
    if (plasterNormal) {
      plasterNormal.wrapS = THREE.RepeatWrapping;
      plasterNormal.wrapT = THREE.RepeatWrapping;
      plasterNormal.repeat.set(6, 6);
      plasterNormal.needsUpdate = true;
    }
  }, [plasterNormal]);

  const isFlatView = viewMode === 'dollhouse' || viewMode === 'walkthrough';
  const isNight = customization.timeOfDay === 'night';
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

  // Initial one-time scene setup, materials audit & classification of meshes
  useEffect(() => {
    if (!scene) return;

    const walls: THREE.MeshStandardMaterial[] = [];
    const floors: THREE.MeshStandardMaterial[] = [];
    const decor: THREE.Object3D[] = [];
    const essential: THREE.Object3D[] = [];
    const ceilings: THREE.Object3D[] = [];

    scene.traverse((child: any) => {
      // Freeze static matrices for instant frame dispatch
      child.matrixAutoUpdate = false;
      child.updateMatrix();

      if (child.isMesh) {
        const name = (child.name || '').toLowerCase();
        const mat = child.material as THREE.MeshStandardMaterial;
        const matName = (mat?.name || '').toLowerCase();

        // Optimized selective shadow casting:
        // Only structural walls, slabs, doors, beds, wardrobes, and major sofas cast shadows.
        // Small tabletop props, accessories, foliage, tableware, and nightstands do not cast shadows.
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
          const physMat = mat as any;

          // 1. Glass Material Normalization (Transmission OFF, envMapIntensity 1.2)
          if (
            name.includes('glass') ||
            matName.includes('glass') ||
            matName.includes('glazing') ||
            name.includes('balustrade') ||
            name.includes('mirror')
          ) {
            physMat.transmission = 0;
            mat.transparent = true;
            mat.opacity = name.includes('mirror') ? 0.95 : 0.35;
            mat.roughness = name.includes('mirror') ? 0.02 : 0.05;
            mat.metalness = name.includes('mirror') ? 0.95 : 0.1;
            mat.envMapIntensity = 1.2;
            mat.depthWrite = false;
            child.renderOrder = 10;
          }
          // 2. Wall Plaster Materials
          else if (
            (matName.includes('warm ivory plaster') || matName.includes('plaster')) &&
            !matName.includes('cutaway') &&
            !matName.includes('ceiling')
          ) {
            mat.roughness = 0.88;
            mat.metalness = 0.02;
            mat.envMapIntensity = 0.6;
            if (plasterNormal) {
              mat.normalMap = plasterNormal;
              mat.normalScale = new THREE.Vector2(0.18, 0.18);
            }
            walls.push(mat);
          }
          // 3. Flooring Materials
          else if (
            matName.includes('travertine') ||
            matName.includes('floor') ||
            name.includes('floor')
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
  }, [scene, plasterNormal]);

  // Instant wall color update (0ms latency, no scene traversal)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const color = new THREE.Color(activeWallColorHex);
    for (const mat of wallMaterialsRef.current) {
      mat.color = color;
    }
  }, [activeWallColorHex]);

  // Instant flooring update with procedural PBR textures (0ms latency)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const floorTexture = getProceduralFloorTexture(flooring);

    for (const mat of floorMaterialsRef.current) {
      mat.map = floorTexture;
      mat.color.set('#FFFFFF');
      if (flooring === 'light_marble') {
        mat.roughness = 0.15;
        mat.metalness = 0.12;
        mat.envMapIntensity = 1.25;
      } else if (flooring === 'warm_oak') {
        mat.roughness = 0.42;
        mat.metalness = 0.04;
        mat.envMapIntensity = 0.8;
      } else if (flooring === 'herringbone') {
        mat.roughness = 0.38;
        mat.metalness = 0.05;
        mat.envMapIntensity = 0.85;
      } else if (flooring === 'dark_slate') {
        mat.roughness = 0.65;
        mat.metalness = 0.08;
        mat.envMapIntensity = 0.55;
      }
      mat.needsUpdate = true;
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

  // Early exit only after all hooks are called
  if (!isFlatView || !flat) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* Real Interior Asset GLB Model */}
      <primitive object={scene} />

      {/* Real Ground Contact Shadow for Flat Base (replaces fake dark blobs) */}
      {!isLiteQuality && viewMode === 'dollhouse' && (
        <ContactShadows
          position={[0, -0.02, -6.0]}
          opacity={0.65}
          scale={34}
          blur={1.6}
          far={8}
          resolution={1024}
          frames={1}
          color="#0B111A"
        />
      )}

      {/* Photorealistic Interior Architectural Lighting */}
      {viewMode === 'walkthrough' && (
        <ambientLight intensity={0.52} color="#FFF8F0" />
      )}
      <pointLight
        position={[7.15, 2.7, -6.74]}
        color={isNight ? '#FFE5B8' : '#FFF5E8'}
        intensity={isNight ? 2.4 : 1.6}
        distance={20}
        decay={2}
      />
      <pointLight
        position={[-7.01, 2.7, -6.93]}
        color={isNight ? '#FFE5B8' : '#FFF5E8'}
        intensity={isNight ? 2.2 : 1.4}
        distance={18}
        decay={2}
      />
      <pointLight
        position={[-9.35, 2.4, -10.22]}
        color={isNight ? '#FFE5B8' : '#FFF7EB'}
        intensity={isNight ? 2.0 : 1.5}
        distance={16}
        decay={2}
      />

      {/* Night Atmosphere Residence Lamps */}
      {isNight && (
        <group>
          <pointLight position={[6.2, 1.2, -8.2]} color="#FFD18A" intensity={1.8} distance={10} decay={2} />
          <pointLight position={[-6.2, 1.2, -8.2]} color="#FFD18A" intensity={1.8} distance={10} decay={2} />
        </group>
      )}

      {/* 3D Floating Room Badges in Dollhouse View */}
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
useTexture.preload(PLASTER_NORMAL_URL);
