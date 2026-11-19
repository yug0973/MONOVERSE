import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { FloorSliceView } from './FloorSliceView';

const GLB_URL = '/models/Aarohan_Tower_G14.glb';
const PLASTER_NORMAL_URL = '/textures/pbr/plaster/Plaster001_1K-JPG_NormalGL.jpg';
const PLASTER_ROUGHNESS_URL = '/textures/pbr/plaster/Plaster001_1K-JPG_Roughness.jpg';

interface TowerMassingProps {
  // Optional props
}

/**
 * Senior Architectural Tower Massing & Dynamic Floor Slice Pipeline
 * - Real G+14 residential tower model (Vadodara architectural luxury standard)
 * - Façade: recessed balconies with reflective glass railings, 180mm slab edge reveals, vertical fins/louvres, 2-tone paint scheme, 100mm deep window reveals.
 * - Podium/Base: double-height lobby with glass curtain wall, cantilevered entrance canopy, landscaped podium, boundary wall, security gate, driveway with ramp.
 * - Crown: terrace parapet wall, lift machine room, water tank enclosure, rooftop pergola pavilion, architectural LED contour lighting.
 * - Windows: InstancedMesh for 112 window bays with slight randomized lit/unlit emissives at night.
 * - Floor Slice: WebGL local clipping plane with smooth 600-900ms spring/ease damping, solid slab cut cap so the interior never looks hollow, and ghosted wireframe upper massing.
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
  const solidMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const nightMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const bollardMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const isInitializedRef = useRef<boolean>(false);

  // ========================================================
  // 1. FLOOR SLICE CLIPPING PLANES & ANIMATION (Requirement 7)
  // ========================================================
  // Solid cut plane (clips away everything above currentCutY)
  const solidClipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 100), []);
  // Ghosted plane (clips away everything below currentCutY)
  const ghostClipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -100), []);

  const currentCutY = useRef<number>(100.0);
  const capRef = useRef<THREE.Group>(null);

  // Ghosted wireframe material for floors above the slice plane (Requirement 7)
  const ghostMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#7B9CB8',
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      clippingPlanes: [ghostClipPlane],
      depthWrite: false,
    });
  }, [ghostClipPlane]);

  const ghostScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.material = ghostMaterial;
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return clone;
  }, [scene, ghostMaterial]);

  // Target cut elevation: Floor 1 is at 6.0m, each floor is 3.2m
  const targetCutY = isSliced && selectedFloorNumber !== null
    ? 6.0 + (selectedFloorNumber - 1) * 3.2 + 0.22
    : 100.0;

  useFrame((_, delta) => {
    // Smooth 600-900ms spring ease damping curve
    currentCutY.current = THREE.MathUtils.damp(
      currentCutY.current,
      targetCutY,
      7.2,
      delta
    );
    solidClipPlane.constant = currentCutY.current;
    ghostClipPlane.constant = -currentCutY.current;

    if (capRef.current) {
      capRef.current.position.y = currentCutY.current;
      capRef.current.visible = isSliced || currentCutY.current < 90.0;
    }
  });

  // ========================================================
  // 2. WINDOW INSTANCING & NIGHT PATTERN (Requirement 4)
  // ========================================================
  const windowMeshRef = useRef<THREE.InstancedMesh>(null);
  const windowCount = 112; // 14 floors x 8 bays per floor

  const windowGeom = useMemo(() => {
    const geom = new THREE.BoxGeometry(5.4, 2.45, 0.04);
    geom.computeVertexNormals();
    return geom;
  }, []);

  const windowMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#A5C4D4',
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.42,
      envMapIntensity: 1.25,
      depthWrite: false,
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [solidClipPlane]);

  // Position master window instances across 14 floors and 4 facade bays
  useLayoutEffect(() => {
    if (!windowMeshRef.current) return;
    const mesh = windowMeshRef.current;
    const dummy = new THREE.Object3D();
    let idx = 0;

    for (let f = 1; f <= 14; f++) {
      const y = 6.0 + (f - 1) * 3.2 + 1.5;

      // 1. South Bay Right (Flat A)
      dummy.position.set(7.8, y, 8.43);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);

      // 2. South Bay Left (Flat D)
      dummy.position.set(-7.8, y, 8.43);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);

      // 3. North Bay Right (Flat B)
      dummy.position.set(7.8, y, -8.43);
      dummy.rotation.set(0, Math.PI, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);

      // 4. North Bay Left (Flat C)
      dummy.position.set(-7.8, y, -8.43);
      dummy.rotation.set(0, Math.PI, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);

      // 5. East Bay Front
      dummy.position.set(12.7, y, 2.8);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);

      // 6. East Bay Rear
      dummy.position.set(12.7, y, -2.8);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);

      // 7. West Bay Front
      dummy.position.set(-12.7, y, 2.8);
      dummy.rotation.set(0, -Math.PI / 2, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);

      // 8. West Bay Rear
      dummy.position.set(-12.7, y, -2.8);
      dummy.rotation.set(0, -Math.PI / 2, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  // Randomized lit/unlit emissive pattern at night (68% lit, 32% unlit)
  useEffect(() => {
    if (!windowMeshRef.current) return;
    const mesh = windowMeshRef.current;

    windowMat.emissive = isNight ? new THREE.Color('#FFCE85') : new THREE.Color('#000000');
    windowMat.emissiveIntensity = isNight ? 0.95 : 0;
    windowMat.needsUpdate = true;

    for (let i = 0; i < windowCount; i++) {
      // Deterministic hash per instance
      const hash = Math.abs(Math.sin((i + 1) * 987.65) * 10000) % 1;
      const isLit = hash > 0.32; // 68% lit

      let color: THREE.Color;
      if (isNight) {
        if (isLit) {
          // Warm 2700K - 3000K residential evening glow with subtle tone variances
          const tone = i % 3;
          color = tone === 0
            ? new THREE.Color('#FFE2A0')
            : tone === 1
            ? new THREE.Color('#FFD588')
            : new THREE.Color('#FFE8B5');
        } else {
          // Unlit dark residential glass
          color = new THREE.Color('#161E28');
        }
      } else {
        color = new THREE.Color('#A5C4D4'); // daytime reflection sky tint
      }

      mesh.setColorAt(i, color);
    }

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [isNight]);

  // ========================================================
  // 3. INITIAL MATERIALS AUDIT & CLASSIFICATION
  // ========================================================
  useEffect(() => {
    if (!scene) return;

    const floorMap = new Map<number, THREE.Object3D[]>();
    for (let f = 1; f <= 14; f++) {
      floorMap.set(f, []);
    }
    const roofNodes: THREE.Object3D[] = [];
    const solidMats: THREE.MeshStandardMaterial[] = [];
    const nightMats: THREE.MeshStandardMaterial[] = [];
    const bollardMats: THREE.MeshStandardMaterial[] = [];

    scene.traverse((child: any) => {
      child.matrixAutoUpdate = false;
      child.updateMatrix();

      if (child.isMesh) {
        const name = (child.name || '').toLowerCase();
        const mat = child.material as THREE.MeshStandardMaterial;
        const matName = (mat?.name || '').toLowerCase();

        const isNonShadow =
          name.includes('glass') ||
          name.includes('glazing') ||
          name.includes('curtain') ||
          name.includes('water') ||
          name.includes('bollard') ||
          matName.includes('glass') ||
          matName.includes('glazing');

        child.castShadow = !isNonShadow;
        child.receiveShadow = true;

        if (mat) {
          const physMat = mat as any;

          // Attach solid clipping plane
          mat.clippingPlanes = [solidClipPlane];
          mat.clipShadows = true;
          solidMats.push(mat);

          // 1. Architectural Glass & Sheer Curtain Normalization
          if (
            name.includes('glass') ||
            matName.includes('glass') ||
            matName.includes('glazing') ||
            name.includes('balustrade') ||
            name.includes('window') ||
            name.includes('curtain') ||
            matName.includes('curtain')
          ) {
            physMat.transmission = 0;
            mat.transparent = true;
            mat.opacity = name.includes('balustrade') ? 0.38 : name.includes('curtain') ? 0.95 : 0.35;
            mat.roughness = name.includes('curtain') ? 0.82 : 0.05;
            mat.metalness = name.includes('curtain') ? 0.01 : 0.1;
            mat.envMapIntensity = 1.25;
            mat.depthWrite = !name.includes('balustrade');
            child.renderOrder = 10;
            if (!name.includes('balustrade') && !matName.includes('balustrade')) {
              nightMats.push(mat);
            }
          }
          // 2. Concrete / Plaster Body & Accent Bands
          else if (
            matName.includes('plaster') ||
            matName.includes('concrete') ||
            name.includes('wall') ||
            name.includes('slab') ||
            name.includes('pier')
          ) {
            mat.roughness = 0.88;
            mat.metalness = 0.02;
            mat.envMapIntensity = 0.55;
            if (plasterNormal) {
              mat.normalMap = plasterNormal;
              mat.normalScale = new THREE.Vector2(0.35, 0.35);
            }
            if (plasterRoughness) {
              mat.roughnessMap = plasterRoughness;
            }
          }
          // 3. Bronze Mullions, Slabs & Vertical Solar Fins
          else if (
            matName.includes('bronze') ||
            matName.includes('metal') ||
            matName.includes('aluminum') ||
            name.includes('mullion') ||
            name.includes('fin') ||
            name.includes('canopy') ||
            name.includes('gate') ||
            name.includes('pergola')
          ) {
            mat.roughness = 0.32;
            mat.metalness = 0.85;
            mat.envMapIntensity = 1.4;
          }

          if (name.includes('bollard') || name.includes('diffuser') || matName.includes('led')) {
            bollardMats.push(mat);
          }
        }
      }

      if (child.name) {
        const match = child.name.match(/(?:Level|Floor)\s*(\d+)/i);
        if (match) {
          const flNum = parseInt(match[1], 10);
          if (flNum >= 1 && flNum <= 14) {
            floorMap.get(flNum)?.push(child);
          }
        }
        if (/roof|crown|pergola|lmr|tank|parapet/i.test(child.name)) {
          roofNodes.push(child);
        }
      }
    });

    floorNodesMapRef.current = floorMap;
    roofNodesRef.current = roofNodes;
    solidMaterialsRef.current = solidMats;
    nightMaterialsRef.current = nightMats;
    bollardMaterialsRef.current = bollardMats;
    isInitializedRef.current = true;
  }, [scene, plasterNormal, plasterRoughness, solidClipPlane]);

  // Night emissive update for building fixtures & window drapes
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const glowColor = new THREE.Color(isNight ? '#FFE0A3' : '#000000');
    const glowIntensity = isNight ? 1.5 : 0;
    for (const mat of nightMaterialsRef.current) {
      mat.emissive = glowColor;
      mat.emissiveIntensity = glowIntensity;
      mat.needsUpdate = true;
    }

    const bollardColor = new THREE.Color(isNight ? '#FFE2B8' : '#000000');
    const bollardIntensity = isNight ? 2.5 : 0;
    for (const mat of bollardMaterialsRef.current) {
      mat.emissive = bollardColor;
      mat.emissiveIntensity = bollardIntensity;
    }
  }, [isNight]);

  // Hide exterior tower when viewing unit dollhouse cutaway or walkthrough
  if (viewMode === 'dollhouse' || viewMode === 'walkthrough') {
    return null;
  }

  return (
    <group position={[0, 0, 0]}>
      {/* 1. G+14 Architectural Tower Model (Clipped smoothly in Floor Slice mode) */}
      <primitive
        object={scene}
        onClick={(e: any) => {
          e.stopPropagation();
          if (viewMode === 'building') {
            selectFloor(selectedFloorNumber || 9);
          }
        }}
      />

      {/* 2. Instanced Windows (112 bays with randomized lit/unlit night pattern) */}
      <instancedMesh
        ref={windowMeshRef}
        args={[windowGeom, windowMat, windowCount]}
      />

      {/* 3. Visible Solid Slab Cut Cap (Eliminates hollow cutaway appearance) */}
      <group ref={capRef} position={[0, 100, 0]} visible={false}>
        {/* Solid concrete floor plate cap at cut line */}
        <mesh position={[0, -0.06, 0]} receiveShadow>
          <boxGeometry args={[25.8, 0.14, 17.8]} />
          <meshStandardMaterial color="#EAE5DC" roughness={0.65} />
        </mesh>
        {/* Structural lift & stair core section cap */}
        <mesh position={[0, 0.12, 0]} receiveShadow>
          <boxGeometry args={[6.2, 0.24, 6.2]} />
          <meshStandardMaterial color="#3D4046" roughness={0.6} />
        </mesh>
      </group>

      {/* 4. Sliced Floor Interactive Cutaway Plan with 4 Quadrant Units */}
      {isSliced && selectedFloorNumber && (
        <FloorSliceView floorNumber={selectedFloorNumber} />
      )}

      {/* 5. Ghosted Wireframe Upper Massing above the sliced floor (Requirement 7) */}
      {(isSliced || currentCutY.current < 90.0) && ghostScene && (
        <primitive object={ghostScene} />
      )}
    </group>
  );
};

useGLTF.preload(GLB_URL);
useTexture.preload(PLASTER_NORMAL_URL);
useTexture.preload(PLASTER_ROUGHNESS_URL);
