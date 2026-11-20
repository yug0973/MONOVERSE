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
  const isDuskOrNight = isNight || customization.timeOfDay === 'golden_hour';
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
  // 2. WINDOW INSTANCING & REALISTIC ~65% LIT / 35% UNLIT NIGHT PATTERN (Requirement 3 & 4)
  // ========================================================
  const litWindowMeshRef = useRef<THREE.InstancedMesh>(null);
  const unlitWindowMeshRef = useRef<THREE.InstancedMesh>(null);

  // Normalized unit plane geometry for flexible per-bay aspect ratio scaling
  const windowGeom = useMemo(() => {
    const geom = new THREE.BoxGeometry(1.0, 1.0, 0.04);
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Split windows into ~65% lit and ~35% unlit sets for true physically accurate night illumination
  const { litMatrices, unlitMatrices } = useMemo(() => {
    const litMats: THREE.Matrix4[] = [];
    const unlitMats: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();
    let idx = 0;

    for (let f = 1; f <= 14; f++) {
      const flElevation = 6.0 + (f - 1) * 3.2;

      const configs = [
        // 1. South Bay Right (Flat A Living Room)
        { pos: [7.8, flElevation + 1.55, 8.44], rot: [0, 0, 0], scale: [5.42, 2.14, 1.0] },
        // 2. South Bay Left (Flat D Living Room)
        { pos: [-7.8, flElevation + 1.55, 8.44], rot: [0, 0, 0], scale: [5.42, 2.14, 1.0] },
        // 3. North Bay Right (Flat B Bedroom)
        { pos: [7.8, flElevation + 1.55, -8.44], rot: [0, Math.PI, 0], scale: [5.42, 2.14, 1.0] },
        // 4. North Bay Left (Flat C Bedroom)
        { pos: [-7.8, flElevation + 1.55, -8.44], rot: [0, Math.PI, 0], scale: [5.42, 2.14, 1.0] },
        // 5. East Bay Front (Flat A Master Bedroom)
        { pos: [12.63, flElevation + 1.70, 3.6], rot: [0, Math.PI / 2, 0], scale: [3.62, 1.86, 1.0] },
        // 6. East Bay Rear (Flat B Master Bedroom)
        { pos: [12.63, flElevation + 1.70, -3.6], rot: [0, Math.PI / 2, 0], scale: [3.62, 1.86, 1.0] },
        // 7. West Bay Front (Flat D Master Bedroom)
        { pos: [-12.63, flElevation + 1.70, 3.6], rot: [0, -Math.PI / 2, 0], scale: [3.62, 1.86, 1.0] },
        // 8. West Bay Rear (Flat C Master Bedroom)
        { pos: [-12.63, flElevation + 1.70, -3.6], rot: [0, -Math.PI / 2, 0], scale: [3.62, 1.86, 1.0] },
      ];

      for (let b = 0; b < 8; b++) {
        const c = configs[b];
        dummy.position.set(c.pos[0], c.pos[1], c.pos[2]);
        dummy.rotation.set(c.rot[0], c.rot[1], c.rot[2]);
        dummy.scale.set(c.scale[0], c.scale[1], c.scale[2]);
        dummy.updateMatrix();

        const hash = Math.abs(Math.sin((idx + 1) * 987.65) * 10000) % 1;
        const isLit = hash > 0.35; // ~65% lit residential windows
        if (isLit) {
          litMats.push(dummy.matrix.clone());
        } else {
          unlitMats.push(dummy.matrix.clone());
        }
        idx++;
      }
    }

    return { litMatrices: litMats, unlitMatrices: unlitMats };
  }, []);

  // Material for illuminated interior windows (rich 2700K warm glow triggering bloom)
  const litWindowMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isDuskOrNight ? '#FFE3A8' : '#9EBAC8',
      emissive: isDuskOrNight ? new THREE.Color('#FFCE85') : new THREE.Color('#000000'),
      emissiveIntensity: isDuskOrNight ? 2.4 : 0,
      roughness: isDuskOrNight ? 0.3 : 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [solidClipPlane, isDuskOrNight]);

  // Material for unlit dark reflective windows (zero emissive, crisp sky reflections)
  const unlitWindowMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isDuskOrNight ? '#121A24' : '#9EBAC8',
      emissive: new THREE.Color('#000000'),
      emissiveIntensity: 0,
      roughness: 0.05,
      metalness: 0.1,
      envMapIntensity: 1.5,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [solidClipPlane, isDuskOrNight]);

  useLayoutEffect(() => {
    if (litWindowMeshRef.current) {
      litMatrices.forEach((mat, i) => litWindowMeshRef.current!.setMatrixAt(i, mat));
      litWindowMeshRef.current.instanceMatrix.needsUpdate = true;
    }
    if (unlitWindowMeshRef.current) {
      unlitMatrices.forEach((mat, i) => unlitWindowMeshRef.current!.setMatrixAt(i, mat));
      unlitWindowMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [litMatrices, unlitMatrices]);

  // Balcony LED linear accent strip lights (56 instances across 14 floors)
  const balconyStripsRef = useRef<THREE.InstancedMesh>(null);
  const balconyStripGeom = useMemo(() => new THREE.BoxGeometry(6.8, 0.04, 0.04), []);
  const balconyStripMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#FFE0A0',
      emissive: isDuskOrNight ? new THREE.Color('#FFE0A0') : new THREE.Color('#000000'),
      emissiveIntensity: isDuskOrNight ? 2.8 : 0,
      roughness: 0.2,
      clippingPlanes: [solidClipPlane],
    });
  }, [solidClipPlane, isDuskOrNight]);

  useLayoutEffect(() => {
    if (!balconyStripsRef.current) return;
    const mesh = balconyStripsRef.current;
    const dummy = new THREE.Object3D();
    let idx = 0;

    for (let f = 1; f <= 14; f++) {
      const flElevation = 6.0 + (f - 1) * 3.2;

      // Flat A (+X, +Z)
      dummy.position.set(7.8, flElevation + 0.02, 10.15);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);

      // Flat D (-X, +Z)
      dummy.position.set(-7.8, flElevation + 0.02, 10.15);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);

      // Flat B (+X, -Z)
      dummy.position.set(7.8, flElevation + 0.02, -10.15);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);

      // Flat C (-X, -Z)
      dummy.position.set(-7.8, flElevation + 0.02, -10.15);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx++, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, []);



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

          // ========================================================
          // 1. BALUSTRADE GLASS (Nearly clear, opacity 0.20, roughness 0.05)
          // ========================================================
          if (
            name.includes('balustrade') ||
            matName.includes('balustrade') ||
            name.includes('glass_front') ||
            name.includes('glass_side')
          ) {
            physMat.transmission = 0;
            mat.transparent = true;
            mat.opacity = 0.20;
            mat.color = new THREE.Color('#D8E2EC');
            mat.roughness = 0.05;
            mat.metalness = 0.1;
            mat.envMapIntensity = 1.4;
            mat.depthWrite = false;
            child.renderOrder = 12;
            child.castShadow = false;
          }
          // ========================================================
          // 2. WINDOW GLAZING (Dark blue-grey, reflective, opacity 0.85)
          // ========================================================
          else if (
            name.includes('window_glass') ||
            name.includes('curtain_wall') ||
            matName.includes('facade glass')
          ) {
            physMat.transmission = 0;
            mat.transparent = true;
            mat.opacity = 0.85;
            mat.color = new THREE.Color('#1C242D'); // Dark blue-grey, never cream
            mat.roughness = 0.05;
            mat.metalness = 0.1;
            mat.envMapIntensity = 1.5;
            mat.depthWrite = false;
            child.renderOrder = 10;
            child.castShadow = false;
            nightMats.push(mat);
          }
          // ========================================================
          // 3. 100% OPAQUE STRUCTURAL SHELL (Walls, Slabs, Core, Columns)
          // ========================================================
          else {
            mat.transparent = false;
            mat.depthWrite = true;
            child.renderOrder = 0;
            child.castShadow = true;
            child.receiveShadow = true;

            // Plaster & Concrete Walls / Columns
            if (
              matName.includes('plaster') ||
              matName.includes('concrete') ||
              matName.includes('limestone') ||
              matName.includes('stone') ||
              name.includes('wall') ||
              name.includes('column') ||
              name.includes('slab') ||
              name.includes('core')
            ) {
              mat.roughness = 0.85;
              mat.metalness = 0.02;
              mat.envMapIntensity = 0.6;
              if (plasterNormal) {
                mat.normalMap = plasterNormal;
                mat.normalScale = new THREE.Vector2(0.25, 0.25);
              }
              if (plasterRoughness) {
                mat.roughnessMap = plasterRoughness;
              }
            }
            // Bronze / Charcoal Aluminum Frames, Mullions, Fins, Parapets
            else if (
              matName.includes('aluminum') ||
              matName.includes('bronze') ||
              matName.includes('frame') ||
              name.includes('frame') ||
              name.includes('mullion') ||
              name.includes('fin') ||
              name.includes('canopy') ||
              name.includes('coping') ||
              name.includes('drip') ||
              name.includes('handrail')
            ) {
              mat.roughness = 0.35;
              mat.metalness = 0.85;
              mat.envMapIntensity = 1.4;
            }

            if (name.includes('led') || matName.includes('led')) {
              bollardMats.push(mat);
            }
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

  // Night & Dusk emissive update for building fixtures & LED elements
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const glowColor = new THREE.Color(isDuskOrNight ? '#FFE0A3' : '#000000');
    const glowIntensity = isDuskOrNight ? 2.2 : 0;
    for (const mat of nightMaterialsRef.current) {
      mat.emissive = glowColor;
      mat.emissiveIntensity = glowIntensity;
      mat.needsUpdate = true;
    }

    const bollardColor = new THREE.Color(isDuskOrNight ? '#FFE2B8' : '#000000');
    const bollardIntensity = isDuskOrNight ? 3.0 : 0;
    for (const mat of bollardMaterialsRef.current) {
      mat.emissive = bollardColor;
      mat.emissiveIntensity = bollardIntensity;
    }
  }, [isDuskOrNight]);

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

      {/* 2a. Lit Windows (~65% of units glowing with warm 2700K interior ambience & bloom) */}
      <instancedMesh
        ref={litWindowMeshRef}
        args={[windowGeom, litWindowMat, litMatrices.length]}
      />

      {/* 2b. Unlit Windows (~35% of units dark reflective architectural glazing) */}
      <instancedMesh
        ref={unlitWindowMeshRef}
        args={[windowGeom, unlitWindowMat, unlitMatrices.length]}
      />

      {/* 2b. Balcony Linear LED Accent Strips (Requirement 3) */}
      <instancedMesh
        ref={balconyStripsRef}
        args={[balconyStripGeom, balconyStripMat, 56]}
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
