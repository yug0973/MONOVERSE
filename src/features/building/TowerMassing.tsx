import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { FloorSliceView } from './FloorSliceView';
import { BUILDING_FLOORS } from '../../data/buildingData';

const GLB_URL = '/models/Heaven_Tower.glb';

// Architectural Proportions: HEAVEN G+9 Luxury Residential Building
const GROUND_HEIGHT = 3.8;   // Ground stilt entrance lobby
const RESIDENTIAL_FLOORS = 9; // 9 typical residential floors
const FLOOR_HEIGHT = 3.1;    // 3.1m floor-to-floor height
const TOWER_HEIGHT = GROUND_HEIGHT + RESIDENTIAL_FLOORS * FLOOR_HEIGHT; // 31.7m
const TOWER_WIDTH = 18.0;    // Front facade width
const TOWER_DEPTH = 16.0;    // Depth

export const TowerMassing: React.FC = () => {
  const {
    viewMode,
    selectedFloorNumber,
    hoveredFloorNumber,
    selectFloor,
    setHoveredFloor,
    customization,
    debugMode,
  } = useAppStore();

  const isNight = customization.timeOfDay === 'night';
  const isDuskOrNight = isNight || customization.timeOfDay === 'golden_hour';
  const isSliced = (viewMode === 'floor_slice' || viewMode === 'dollhouse') && selectedFloorNumber !== null;

  // Load the true 3D procedural GLB model of the HEAVEN building
  const { scene } = useGLTF(GLB_URL);

  // ========================================================
  // 1. FLOOR SLICE CLIPPING PLANES & SMOOTH SPRING EASING
  // ========================================================
  const solidClipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 100), []);
  const ghostClipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -100), []);
  const currentCutY = useRef<number>(100.0);
  const capRef = useRef<THREE.Group>(null);

  const targetCutY = isSliced && selectedFloorNumber !== null
    ? GROUND_HEIGHT + (Math.min(selectedFloorNumber, RESIDENTIAL_FLOORS) - 1) * FLOOR_HEIGHT + 0.2
    : 100.0;

  useFrame((_, delta) => {
    currentCutY.current = THREE.MathUtils.damp(currentCutY.current, targetCutY, 7.5, delta);
    solidClipPlane.constant = currentCutY.current;
    ghostClipPlane.constant = -currentCutY.current;

    if (capRef.current) {
      capRef.current.position.y = currentCutY.current;
      capRef.current.visible = isSliced || currentCutY.current < 90.0;
    }
  });

  // ========================================================
  // 2. CLONE & TRAVERSE GLB SCENE WITH PBR & CLIPPING PLANES
  // ========================================================
  const isClay = debugMode === 'clay';
  const isWireframe = debugMode === 'wireframe';

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    const clayMaterial = new THREE.MeshStandardMaterial({
      color: '#E8E3D8',
      roughness: 0.85,
      metalness: 0.02,
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: '#3B6894',
      wireframe: true,
      clippingPlanes: [solidClipPlane],
    });

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (isClay) {
          mesh.material = clayMaterial;
        } else if (isWireframe) {
          mesh.material = wireframeMaterial;
        } else if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            mat.clippingPlanes = [solidClipPlane];
            mat.clipShadows = true;
          });
        } else if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.clippingPlanes = [solidClipPlane];
          mat.clipShadows = true;

          // Emissive response for window interiors at dusk and night
          if (mesh.name.includes('Glow') || mesh.name.includes('Lobby_Light')) {
            if (isDuskOrNight) {
              mat.emissive = new THREE.Color('#FFB860');
              mat.emissiveIntensity = 1.35;
            } else {
              mat.emissive = new THREE.Color('#000000');
              mat.emissiveIntensity = 0.0;
            }
          }
        }
      }
    });

    return clone;
  }, [scene, isClay, isWireframe, isDuskOrNight, solidClipPlane]);

  // Terracotta Highlight Ribbon for Floor Hover / Selection
  const terracottaHighlightMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#C85A32',
      emissive: new THREE.Color('#D9653B'),
      emissiveIntensity: 2.8,
      roughness: 0.22,
      metalness: 0.1,
      transparent: true,
      opacity: 0.88,
      clippingPlanes: [solidClipPlane],
    });
  }, [solidClipPlane]);

  // Ghosted Wireframe Material for upper massing in Floor Slice mode
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

  // Hide exterior tower when viewing unit dollhouse cutaway, walkthrough, or panorama
  if (viewMode === 'dollhouse' || viewMode === 'walkthrough' || viewMode === 'panorama') {
    return null;
  }

  return (
    <group position={[0, 0, 0]}>
      {/* ======================================================== */}
      {/* 1. TRUE 3D GLB MODEL: "HEAVEN" BUILDING (G+9)            */}
      {/* ======================================================== */}
      <group
        onClick={(e: any) => {
          e.stopPropagation();
          if (viewMode === 'building') {
            selectFloor(selectedFloorNumber || 5);
          }
        }}
      >
        <primitive object={clonedScene} />

        {/* ======================================================== */}
        {/* 2. FLOOR RAYCAST HITBOXES & SELECTION HIGHLIGHT RIBBONS  */}
        {/* ======================================================== */}
        {Array.from({ length: RESIDENTIAL_FLOORS }, (_, i) => i + 1).map((f) => {
          const flElevation = GROUND_HEIGHT + (f - 1) * FLOOR_HEIGHT;
          const isFloorActive = hoveredFloorNumber === f || selectedFloorNumber === f;

          return (
            <group key={`floor-hitbox-group-${f}`}>
              {/* Invisible raycast interaction volume */}
              <mesh
                position={[0, flElevation + FLOOR_HEIGHT / 2, 0]}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  setHoveredFloor(f);
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  setHoveredFloor(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectFloor(f);
                }}
              >
                <boxGeometry args={[TOWER_WIDTH + 1.2, FLOOR_HEIGHT, TOWER_DEPTH + 1.2]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>

              {/* Glowing Terracotta Ribbon for Hover/Select */}
              {isFloorActive && (
                <group position={[0, flElevation + 0.15, 0]}>
                  {/* Perimeter continuous glowing ribbon */}
                  <mesh material={terracottaHighlightMat} renderOrder={14}>
                    <boxGeometry args={[TOWER_WIDTH + 0.5, 0.35, TOWER_DEPTH + 0.5]} />
                  </mesh>

                  {/* Corner architectural vertical glow markers */}
                  <mesh position={[TOWER_WIDTH / 2 + 0.26, FLOOR_HEIGHT / 2 - 0.15, TOWER_DEPTH / 2 + 0.26]} material={terracottaHighlightMat}>
                    <boxGeometry args={[0.08, FLOOR_HEIGHT - 0.2, 0.08]} />
                  </mesh>
                  <mesh position={[-TOWER_WIDTH / 2 - 0.26, FLOOR_HEIGHT / 2 - 0.15, TOWER_DEPTH / 2 + 0.26]} material={terracottaHighlightMat}>
                    <boxGeometry args={[0.08, FLOOR_HEIGHT - 0.2, 0.08]} />
                  </mesh>
                  <mesh position={[TOWER_WIDTH / 2 + 0.26, FLOOR_HEIGHT / 2 - 0.15, -TOWER_DEPTH / 2 - 0.26]} material={terracottaHighlightMat}>
                    <boxGeometry args={[0.08, FLOOR_HEIGHT - 0.2, 0.08]} />
                  </mesh>
                  <mesh position={[-TOWER_WIDTH / 2 - 0.26, FLOOR_HEIGHT / 2 - 0.15, -TOWER_DEPTH / 2 - 0.26]} material={terracottaHighlightMat}>
                    <boxGeometry args={[0.08, FLOOR_HEIGHT - 0.2, 0.08]} />
                  </mesh>
                </group>
              )}
            </group>
          );
        })}

        {/* Floor Hover Tooltip */}
        {hoveredFloorNumber !== null && selectedFloorNumber === null && (
          (() => {
            const flData = BUILDING_FLOORS.find((f) => f.floorNumber === hoveredFloorNumber);
            const availCount = flData?.flats.filter((flat) => flat.status === 'AVAILABLE').length ?? 3;
            const flElev = GROUND_HEIGHT + (hoveredFloorNumber - 1) * FLOOR_HEIGHT + FLOOR_HEIGHT * 0.5;
            return (
              <Html
                position={[0, flElev, TOWER_DEPTH / 2 + 2.0]}
                center
                distanceFactor={32}
                style={{ pointerEvents: 'none' }}
              >
                <div className="bg-canvas-light/95 backdrop-blur-md border border-accent-terracotta/40 px-3.5 py-1.5 rounded-full shadow-elevation flex items-center gap-2 whitespace-nowrap select-none transition-all">
                  <span className="w-2 h-2 rounded-full bg-accent-terracotta shadow-[0_0_8px_#C85A32]" />
                  <span className="font-serif text-sm font-semibold text-ink-primary">
                    Floor {hoveredFloorNumber}
                  </span>
                  <span className="text-xs text-ink-muted">·</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    {availCount} available
                  </span>
                </div>
              </Html>
            );
          })()
        )}

        {/* Subtle dimming scrim when a floor is selected */}
        {selectedFloorNumber !== null && (
          <mesh position={[0, TOWER_HEIGHT / 2, 0]} renderOrder={9}>
            <boxGeometry args={[TOWER_WIDTH + 0.4, TOWER_HEIGHT + 0.4, TOWER_DEPTH + 0.4]} />
            <meshBasicMaterial color="#0A0E17" transparent opacity={0.32} depthWrite={false} />
          </mesh>
        )}
      </group>

      {/* ======================================================== */}
      {/* 3. FLOOR SLICE: SOLID CUT CAP & GHOSTED UPPER MASSING     */}
      {/* ======================================================== */}
      <group ref={capRef} position={[0, 100, 0]} visible={false}>
        <mesh position={[0, -0.06, 0]} receiveShadow>
          <boxGeometry args={[TOWER_WIDTH + 0.4, 0.16, TOWER_DEPTH + 0.4]} />
          <meshStandardMaterial color="#EAE5DC" roughness={0.68} />
        </mesh>
        <mesh position={[0, 0.14, 0]} receiveShadow>
          <boxGeometry args={[5.2, 0.26, 5.2]} />
          <meshStandardMaterial color="#3D4046" roughness={0.6} />
        </mesh>
      </group>

      {/* Sliced Floor Interactive Cutaway Plan */}
      {isSliced && selectedFloorNumber && (
        <FloorSliceView floorNumber={selectedFloorNumber} />
      )}

      {/* Ghosted Wireframe Upper Massing above sliced floor */}
      {(isSliced || currentCutY.current < 90.0) && (
        <mesh position={[0, TOWER_HEIGHT / 2, 0]} material={ghostMaterial}>
          <boxGeometry args={[TOWER_WIDTH, TOWER_HEIGHT, TOWER_DEPTH]} />
        </mesh>
      )}
    </group>
  );
};

useGLTF.preload(GLB_URL);
