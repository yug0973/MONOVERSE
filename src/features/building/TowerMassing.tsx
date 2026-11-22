import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Html } from '@react-three/drei';
import { BUILDING_FLOORS } from '../../data/buildingData';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { FloorSliceView } from './FloorSliceView';

// Production Texture Assets (Module 1 & 2)
const FRONT_ELEVATION_URL = '/textures/facade/tower_front_elevation_orthographic_v1.png';
const FRONT_EMISSIVE_URL = '/textures/facade/tower_front_emissive_v1.png';
const SIDE_ELEVATION_URL = '/textures/facade/tower_side_elevation_orthographic_v1.png';
const SIDE_EMISSIVE_URL = '/textures/facade/tower_side_emissive_v1.png';
const PLASTER_NORMAL_URL = '/textures/pbr/plaster/Plaster001_1K-JPG_NormalGL.jpg';
const PLASTER_ROUGHNESS_URL = '/textures/pbr/plaster/Plaster001_1K-JPG_Roughness.jpg';

// Architectural Proportions (G+14 Residential Tower, Vadodara Luxury Standard)
const PODIUM_HEIGHT = 6.0; // Double-height entrance lobby & amenity podium
const RESIDENTIAL_FLOORS = 14;
const FLOOR_HEIGHT = 3.0; // 3.0m floor-to-floor height per spec
const TOWER_HEIGHT = PODIUM_HEIGHT + RESIDENTIAL_FLOORS * FLOOR_HEIGHT; // 48.0m to roof slab
const TOWER_WIDTH = 24.8; // Transverse width (East-West axis)
const TOWER_DEPTH = 17.6; // Longitudinal depth (North-South axis)
const SLAB_THICKNESS = 0.18; // 180mm concrete slab edge per spec
const SLAB_OVERHANG = 0.35; // 350mm cantilevered balcony/slab projection
const RAILING_HEIGHT = 1.1; // 1.1m building code glass balustrade height
const PARAPET_HEIGHT = 1.2; // 1.2m rooftop parapet safety wall

// New architectural constants for photorealistic detailing
const TERRACOTTA_COLUMN_WIDTH = 2.0;
const TERRACOTTA_COLUMN_DEPTH = 0.4;
const CENTRAL_SCREEN_WIDTH = 1.2;
const CENTRAL_SCREEN_BAR_SPACING = 0.15;
const WINDOW_RECESS_DEPTH = 0.15;
const MULLION_BAR_THICKNESS = 0.06;
const CROWN_SETBACK = 0.5;
const CROWN_FLOORS = 2;
const DOWNLIGHT_SIZE = 0.12;
const DOWNLIGHT_SPACING = 1.8;

interface TowerMassingProps {
  // Optional props
}

/**
 * Senior Architectural Tower Massing (Module 2 — Photorealistic Rewrite)
 * - Real G+14 residential tower mass at true architectural proportions
 * - Calibrated UV mapping of orthographic front and side elevation textures
 * - Derived emissive maps for warm glowing dusk windows (bloom on emissive only)
 * - Physical 3D geometry layered over textures:
 *    * Terracotta vertical column panels (rust-brown framing)
 *    * Central decorative metal louver screen
 *    * Per-floor 3D window mullion grids with recessed glass
 *    * Balcony soffit downlights at dusk/night
 *    * Stone-clad podium base
 *    * Stepped crown with setback on top 2 floors
 *    * 180mm slab edges at each floor with contrasting drip edges
 *    * Continuous glass railing planes with steel handrails
 *    * Cantilevered double-height lobby canopy at grade
 *    * Solid roof parapet wall, LMR, water tank, and pergola pavilion
 * - Full ?debug=1 hotkey support: Textured -> Pure White Clay -> Wireframe
 * - Retains smooth 600-900ms spring-eased floor slice clipping plane with solid cut cap
 */
export const TowerMassing: React.FC<TowerMassingProps> = () => {
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

  // Load PBR Façade & Plaster Textures
  const [
    frontTex,
    frontEmissiveTex,
    sideTex,
    sideEmissiveTex,
    plasterNormal,
    plasterRoughness,
  ] = useTexture([
    FRONT_ELEVATION_URL,
    FRONT_EMISSIVE_URL,
    SIDE_ELEVATION_URL,
    SIDE_EMISSIVE_URL,
    PLASTER_NORMAL_URL,
    PLASTER_ROUGHNESS_URL,
  ]);

  // Texture configuration (colorSpace & wrap)
  useEffect(() => {
    if (frontTex) {
      frontTex.colorSpace = THREE.SRGBColorSpace;
      frontTex.anisotropy = 8;
      frontTex.needsUpdate = true;
    }
    if (frontEmissiveTex) {
      frontEmissiveTex.colorSpace = THREE.SRGBColorSpace;
      frontEmissiveTex.needsUpdate = true;
    }
    if (sideTex) {
      sideTex.colorSpace = THREE.SRGBColorSpace;
      sideTex.anisotropy = 8;
      sideTex.needsUpdate = true;
    }
    if (sideEmissiveTex) {
      sideEmissiveTex.colorSpace = THREE.SRGBColorSpace;
      sideEmissiveTex.needsUpdate = true;
    }
    if (plasterNormal) {
      plasterNormal.wrapS = THREE.RepeatWrapping;
      plasterNormal.wrapT = THREE.RepeatWrapping;
      plasterNormal.repeat.set(6, 12);
      plasterNormal.needsUpdate = true;
    }
    if (plasterRoughness) {
      plasterRoughness.wrapS = THREE.RepeatWrapping;
      plasterRoughness.wrapT = THREE.RepeatWrapping;
      plasterRoughness.repeat.set(6, 12);
      plasterRoughness.needsUpdate = true;
    }
  }, [frontTex, frontEmissiveTex, sideTex, sideEmissiveTex, plasterNormal, plasterRoughness]);

  // ========================================================
  // 1. FLOOR SLICE CLIPPING PLANES & SMOOTH SPRING EASING
  // ========================================================
  const solidClipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 100), []);
  const ghostClipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -100), []);
  const currentCutY = useRef<number>(100.0);
  const capRef = useRef<THREE.Group>(null);

  // Target cut elevation: Floor 1 is at 6.0m, each floor is 3.0m
  const targetCutY = isSliced && selectedFloorNumber !== null
    ? PODIUM_HEIGHT + (selectedFloorNumber - 1) * FLOOR_HEIGHT + 0.2
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
  // 2. MATERIALS: TEXTURED, WHITE CLAY & WIREFRAME MODES
  // ========================================================
  const isClay = debugMode === 'clay';
  const isWireframe = debugMode === 'wireframe';

  // Front Façade Material (+Z face)
  const frontMaterial = useMemo(() => {
    if (isClay) {
      return new THREE.MeshStandardMaterial({
        color: '#F4F0E8',
        roughness: 0.85,
        metalness: 0.02,
        clippingPlanes: [solidClipPlane],
        clipShadows: true,
      });
    }
    if (isWireframe) {
      return new THREE.MeshBasicMaterial({
        color: '#4B6B94',
        wireframe: true,
        clippingPlanes: [solidClipPlane],
      });
    }
    return new THREE.MeshStandardMaterial({
      map: frontTex,
      emissiveMap: frontEmissiveTex,
      emissive: isDuskOrNight ? new THREE.Color('#FFB870') : new THREE.Color('#000000'),
      emissiveIntensity: isDuskOrNight ? 1.85 : 0.0,
      roughness: 0.65,
      metalness: 0.08,
      envMapIntensity: 1.1,
      normalMap: plasterNormal,
      normalScale: new THREE.Vector2(0.12, 0.12),
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [isClay, isWireframe, frontTex, frontEmissiveTex, isDuskOrNight, plasterNormal, solidClipPlane]);

  // Side Façade Material (East and West ±X faces)
  const sideMaterial = useMemo(() => {
    if (isClay) {
      return new THREE.MeshStandardMaterial({
        color: '#F4F0E8',
        roughness: 0.85,
        metalness: 0.02,
        clippingPlanes: [solidClipPlane],
        clipShadows: true,
      });
    }
    if (isWireframe) {
      return new THREE.MeshBasicMaterial({
        color: '#4B6B94',
        wireframe: true,
        clippingPlanes: [solidClipPlane],
      });
    }
    return new THREE.MeshStandardMaterial({
      map: sideTex,
      emissiveMap: sideEmissiveTex,
      emissive: isDuskOrNight ? new THREE.Color('#FFB870') : new THREE.Color('#000000'),
      emissiveIntensity: isDuskOrNight ? 1.85 : 0.0,
      roughness: 0.65,
      metalness: 0.08,
      envMapIntensity: 1.1,
      normalMap: plasterNormal,
      normalScale: new THREE.Vector2(0.12, 0.12),
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [isClay, isWireframe, sideTex, sideEmissiveTex, isDuskOrNight, plasterNormal, solidClipPlane]);

  // Rear Plaster Material (-Z face) & Roof Deck (+Y face)
  const plasterMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isClay ? '#F4F0E8' : '#E8E1D5',
      roughness: 0.85,
      metalness: 0.02,
      envMapIntensity: 0.8,
      normalMap: plasterNormal,
      normalScale: new THREE.Vector2(0.2, 0.2),
      roughnessMap: plasterRoughness,
      wireframe: isWireframe,
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [isClay, isWireframe, plasterNormal, plasterRoughness, solidClipPlane]);

  // Physical 180mm Slab Edge Material (contrasting warm off-white stone with dark drip edge)
  const slabEdgeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isClay ? '#EAE6DD' : '#F2ECE4',
      roughness: 0.72,
      metalness: 0.04,
      envMapIntensity: 0.9,
      wireframe: isWireframe,
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [isClay, isWireframe, solidClipPlane]);

  // Dark Architectural Bronze / Charcoal Fascia & Frame Material
  const bronzeTrimMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isClay ? '#D8D4CC' : '#2A2A2E',
      roughness: 0.38,
      metalness: 0.82,
      envMapIntensity: 1.4,
      wireframe: isWireframe,
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [isClay, isWireframe, solidClipPlane]);

  // Reflective Balcony Glass Railing Material (nearly clear, opacity 0.32, roughness 0.04)
  const glassRailingMaterial = useMemo(() => {
    if (isWireframe) {
      return new THREE.MeshBasicMaterial({ color: '#5A8BB5', wireframe: true, clippingPlanes: [solidClipPlane] });
    }
    return new THREE.MeshStandardMaterial({
      color: isClay ? '#D8E2EC' : '#D0DEE8',
      transparent: true,
      opacity: isClay ? 0.45 : 0.32,
      roughness: 0.04,
      metalness: 0.12,
      envMapIntensity: 1.6,
      depthWrite: false,
      clippingPlanes: [solidClipPlane],
    });
  }, [isClay, isWireframe, solidClipPlane]);

  // Lobby Canopy Warm Emissive Soffit Strip
  const canopyLightMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#FFE0A8',
      emissive: isDuskOrNight ? new THREE.Color('#FFE0A8') : new THREE.Color('#000000'),
      emissiveIntensity: isDuskOrNight ? 2.6 : 0,
      roughness: 0.2,
      wireframe: isWireframe,
      clippingPlanes: [solidClipPlane],
    });
  }, [isDuskOrNight, isWireframe, solidClipPlane]);

  // Terracotta Emissive Highlight Ribbon for Floor Hover & Selection (Module 3)
  const terracottaHighlightMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#C85A32',
      emissive: new THREE.Color('#D9653B'),
      emissiveIntensity: 2.85,
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

  // ========================================================
  // NEW MATERIALS: Terracotta, Stone Cladding, Window Glass, Downlights
  // ========================================================

  // Terracotta / Rust-Brown Vertical Column Panel Material
  const terracottaColumnMaterial = useMemo(() => {
    if (isWireframe) {
      return new THREE.MeshBasicMaterial({ color: '#8B6B4B', wireframe: true, clippingPlanes: [solidClipPlane] });
    }
    return new THREE.MeshStandardMaterial({
      color: isClay ? '#E0D8CC' : '#8B4513',
      roughness: 0.7,
      metalness: 0.05,
      envMapIntensity: 0.9,
      normalMap: plasterNormal,
      normalScale: new THREE.Vector2(0.18, 0.18),
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [isClay, isWireframe, plasterNormal, solidClipPlane]);

  // Natural Stone Cladding Material (podium base)
  const stoneMaterial = useMemo(() => {
    if (isWireframe) {
      return new THREE.MeshBasicMaterial({ color: '#5A5048', wireframe: true, clippingPlanes: [solidClipPlane] });
    }
    return new THREE.MeshStandardMaterial({
      color: isClay ? '#D8D4CC' : '#4A4038',
      roughness: 0.9,
      metalness: 0.03,
      envMapIntensity: 0.6,
      normalMap: plasterNormal,
      normalScale: new THREE.Vector2(0.3, 0.3),
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [isClay, isWireframe, plasterNormal, solidClipPlane]);

  // Cream/Warm Beige Plaster Wall Material (between terracotta columns)
  const creamPlasterMaterial = useMemo(() => {
    if (isWireframe) {
      return new THREE.MeshBasicMaterial({ color: '#B8B0A0', wireframe: true, clippingPlanes: [solidClipPlane] });
    }
    return new THREE.MeshStandardMaterial({
      color: isClay ? '#F4F0E8' : '#E8DFD0',
      roughness: 0.82,
      metalness: 0.02,
      envMapIntensity: 0.8,
      normalMap: plasterNormal,
      normalScale: new THREE.Vector2(0.15, 0.15),
      roughnessMap: plasterRoughness,
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [isClay, isWireframe, plasterNormal, plasterRoughness, solidClipPlane]);

  // Window Glass Material (emissive at dusk/night)
  const windowGlassMaterial = useMemo(() => {
    if (isWireframe) {
      return new THREE.MeshBasicMaterial({ color: '#4080B0', wireframe: true, clippingPlanes: [solidClipPlane] });
    }
    return new THREE.MeshStandardMaterial({
      color: isClay ? '#C8D4E0' : '#88A8C0',
      transparent: true,
      opacity: isClay ? 0.6 : 0.45,
      roughness: 0.05,
      metalness: 0.15,
      envMapIntensity: 2.0,
      emissive: isDuskOrNight ? new THREE.Color('#FFD090') : new THREE.Color('#000000'),
      emissiveIntensity: isDuskOrNight ? 2.2 : 0.0,
      depthWrite: false,
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [isClay, isWireframe, isDuskOrNight, solidClipPlane]);

  // Balcony Soffit Downlight Emissive Material
  const downlightMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#FFF0D0',
      emissive: isDuskOrNight ? new THREE.Color('#FFE8B0') : new THREE.Color('#000000'),
      emissiveIntensity: isDuskOrNight ? 3.5 : 0,
      roughness: 0.1,
      clippingPlanes: [solidClipPlane],
      clipShadows: true,
    });
  }, [isDuskOrNight, solidClipPlane]);

  // Calculate floor elevation levels for geometry loop
  const floorLevels = useMemo(() => {
    const levels: number[] = [];
    for (let f = 1; f <= RESIDENTIAL_FLOORS; f++) {
      levels.push(PODIUM_HEIGHT + (f - 1) * FLOOR_HEIGHT);
    }
    levels.push(TOWER_HEIGHT); // Roof slab level
    return levels;
  }, []);

  // ========================================================
  // PRECOMPUTE: Central Metal Screen Louver Bar Positions
  // ========================================================
  const screenBarPositions = useMemo(() => {
    const positions: number[] = [];
    const barCount = Math.floor(CENTRAL_SCREEN_WIDTH / CENTRAL_SCREEN_BAR_SPACING);
    const startX = -CENTRAL_SCREEN_WIDTH / 2;
    for (let i = 0; i <= barCount; i++) {
      positions.push(startX + i * CENTRAL_SCREEN_BAR_SPACING);
    }
    return positions;
  }, []);

  // ========================================================
  // PRECOMPUTE: Window Mullion Grid Positions (per floor half)
  // ========================================================
  const windowBayData = useMemo(() => {
    // Each half of the front facade (left of center, right of center)
    // has ~4 window bays separated by mullions
    const halfWidth = TOWER_WIDTH / 2 - TERRACOTTA_COLUMN_WIDTH - CENTRAL_SCREEN_WIDTH / 2;
    const bayCount = 4;
    const bayWidth = halfWidth / bayCount;
    return { halfWidth, bayCount, bayWidth };
  }, []);

  // ========================================================
  // PRECOMPUTE: Downlight positions along slab overhang
  // ========================================================
  const downlightPositions = useMemo(() => {
    const positions: number[] = [];
    const span = TOWER_WIDTH - 2;
    const count = Math.floor(span / DOWNLIGHT_SPACING);
    const startX = -span / 2;
    for (let i = 0; i <= count; i++) {
      positions.push(startX + i * DOWNLIGHT_SPACING);
    }
    return positions;
  }, []);

  // Hide exterior tower when viewing unit dollhouse cutaway, walkthrough, or panorama
  if (viewMode === 'dollhouse' || viewMode === 'walkthrough' || viewMode === 'panorama') {
    return null;
  }

  // Crown floor indices (0-based from residential floor 1): top 2 floors
  const crownStartFloor = RESIDENTIAL_FLOORS - CROWN_FLOORS; // floor index 12 (floor 13) and 13 (floor 14)

  return (
    <group position={[0, 0, 0]}>
      {/* ======================================================== */}
      {/* 1. SOLID TOWER MASSING WITH UV-MAPPED ELEVATION FACES     */}
      {/* ======================================================== */}
      <group
        onClick={(e: any) => {
          e.stopPropagation();
          if (viewMode === 'building') {
            selectFloor(selectedFloorNumber || 9);
          }
        }}
      >
        {/* Core Structural Massing Box (Receives rear & internal body) */}
        <mesh
          position={[0, TOWER_HEIGHT / 2, 0]}
          castShadow
          receiveShadow
          material={plasterMaterial}
        >
          <boxGeometry args={[TOWER_WIDTH, TOWER_HEIGHT, TOWER_DEPTH]} />
        </mesh>

        {/* Front Elevation Textured Plane (+Z face) */}
        <mesh
          position={[0, TOWER_HEIGHT / 2, TOWER_DEPTH / 2 + 0.02]}
          castShadow
          receiveShadow
          material={frontMaterial}
        >
          <planeGeometry args={[TOWER_WIDTH, TOWER_HEIGHT]} />
        </mesh>

        {/* Right Side Elevation Textured Plane (+X face) */}
        <mesh
          position={[TOWER_WIDTH / 2 + 0.02, TOWER_HEIGHT / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
          receiveShadow
          material={sideMaterial}
        >
          <planeGeometry args={[TOWER_DEPTH, TOWER_HEIGHT]} />
        </mesh>

        {/* Left Side Elevation Textured Plane (-X face) */}
        <mesh
          position={[-TOWER_WIDTH / 2 - 0.02, TOWER_HEIGHT / 2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          castShadow
          receiveShadow
          material={sideMaterial}
        >
          <planeGeometry args={[TOWER_DEPTH, TOWER_HEIGHT]} />
        </mesh>

        {/* ======================================================== */}
        {/* NEW 1: TERRACOTTA VERTICAL COLUMN PANELS                  */}
        {/* 4 columns: 2 on front corners, 2 visible on side returns */}
        {/* ======================================================== */}
        {(() => {
          const towerHalfH = TOWER_HEIGHT / 2;
          const colPositions: Array<{ pos: [number, number, number]; size: [number, number, number] }> = [
            // Front-Right corner column (front face)
            {
              pos: [TOWER_WIDTH / 2 - TERRACOTTA_COLUMN_WIDTH / 2, towerHalfH, TOWER_DEPTH / 2 + 0.04],
              size: [TERRACOTTA_COLUMN_WIDTH, TOWER_HEIGHT, TERRACOTTA_COLUMN_DEPTH],
            },
            // Front-Left corner column (front face)
            {
              pos: [-TOWER_WIDTH / 2 + TERRACOTTA_COLUMN_WIDTH / 2, towerHalfH, TOWER_DEPTH / 2 + 0.04],
              size: [TERRACOTTA_COLUMN_WIDTH, TOWER_HEIGHT, TERRACOTTA_COLUMN_DEPTH],
            },
            // Right side return column (+X face, at front edge)
            {
              pos: [TOWER_WIDTH / 2 + 0.04, towerHalfH, TOWER_DEPTH / 2 - TERRACOTTA_COLUMN_WIDTH / 2],
              size: [TERRACOTTA_COLUMN_DEPTH, TOWER_HEIGHT, TERRACOTTA_COLUMN_WIDTH],
            },
            // Left side return column (-X face, at front edge)
            {
              pos: [-TOWER_WIDTH / 2 - 0.04, towerHalfH, TOWER_DEPTH / 2 - TERRACOTTA_COLUMN_WIDTH / 2],
              size: [TERRACOTTA_COLUMN_DEPTH, TOWER_HEIGHT, TERRACOTTA_COLUMN_WIDTH],
            },
          ];

          return colPositions.map((col, i) => (
            <mesh
              key={`terracotta-col-${i}`}
              position={col.pos}
              castShadow
              receiveShadow
              material={terracottaColumnMaterial}
            >
              <boxGeometry args={col.size} />
            </mesh>
          ));
        })()}

        {/* ======================================================== */}
        {/* NEW 2: CENTRAL DECORATIVE METAL LOUVER SCREEN              */}
        {/* Vertical dark metal bars running up center of front facade */}
        {/* ======================================================== */}
        <group position={[0, TOWER_HEIGHT / 2, TOWER_DEPTH / 2 + 0.06]}>
          {screenBarPositions.map((xOff, i) => (
            <mesh
              key={`screen-bar-${i}`}
              position={[xOff, 0, 0]}
              castShadow
              material={bronzeTrimMaterial}
            >
              <boxGeometry args={[0.025, TOWER_HEIGHT - PODIUM_HEIGHT, 0.05]} />
            </mesh>
          ))}
          {/* Horizontal cross-ties every 3m (per floor) */}
          {floorLevels.slice(0, RESIDENTIAL_FLOORS).map((elev, i) => (
            <mesh
              key={`screen-tie-${i}`}
              position={[0, elev - TOWER_HEIGHT / 2 + FLOOR_HEIGHT / 2, 0]}
              material={bronzeTrimMaterial}
            >
              <boxGeometry args={[CENTRAL_SCREEN_WIDTH, 0.02, 0.03]} />
            </mesh>
          ))}
        </group>

        {/* ======================================================== */}
        {/* NEW 3 & 4: PER-FLOOR WINDOW MULLION FRAMES + RECESSED GLASS */}
        {/* ======================================================== */}
        {floorLevels.slice(0, RESIDENTIAL_FLOORS).map((elevation, floorIdx) => {
          const floorCenterY = elevation + FLOOR_HEIGHT / 2;
          const windowHeight = FLOOR_HEIGHT - SLAB_THICKNESS - 0.12; // Clear glass height
          const isInCrown = floorIdx >= crownStartFloor;
          const crownInset = isInCrown ? CROWN_SETBACK : 0;

          // For each half (left & right of center screen)
          return (
            <group key={`window-floor-${floorIdx}`}>
              {/* Right half windows */}
              <group position={[
                CENTRAL_SCREEN_WIDTH / 2 + windowBayData.halfWidth / 2 + TERRACOTTA_COLUMN_WIDTH * 0.0,
                floorCenterY,
                TOWER_DEPTH / 2 - WINDOW_RECESS_DEPTH / 2 + 0.02 - crownInset
              ]}>
                {/* Recessed glass panel */}
                <mesh material={windowGlassMaterial} renderOrder={5}>
                  <planeGeometry args={[windowBayData.halfWidth - 0.1, windowHeight]} />
                </mesh>
                {/* Vertical mullion bars */}
                {Array.from({ length: windowBayData.bayCount + 1 }, (_, i) => {
                  const x = -windowBayData.halfWidth / 2 + i * windowBayData.bayWidth;
                  return (
                    <mesh
                      key={`rmullion-v-${i}`}
                      position={[x, 0, WINDOW_RECESS_DEPTH / 2 + 0.01]}
                      castShadow
                      material={bronzeTrimMaterial}
                    >
                      <boxGeometry args={[MULLION_BAR_THICKNESS, windowHeight + 0.04, MULLION_BAR_THICKNESS]} />
                    </mesh>
                  );
                })}
                {/* Horizontal mullion bars (top & bottom of window) */}
                {[-windowHeight / 2, windowHeight / 2].map((yOff, i) => (
                  <mesh
                    key={`rmullion-h-${i}`}
                    position={[0, yOff, WINDOW_RECESS_DEPTH / 2 + 0.01]}
                    castShadow
                    material={bronzeTrimMaterial}
                  >
                    <boxGeometry args={[windowBayData.halfWidth, MULLION_BAR_THICKNESS, MULLION_BAR_THICKNESS]} />
                  </mesh>
                ))}
                {/* Mid-height horizontal transom bar */}
                <mesh
                  position={[0, windowHeight * 0.3, WINDOW_RECESS_DEPTH / 2 + 0.01]}
                  castShadow
                  material={bronzeTrimMaterial}
                >
                  <boxGeometry args={[windowBayData.halfWidth, MULLION_BAR_THICKNESS * 0.8, MULLION_BAR_THICKNESS]} />
                </mesh>
              </group>

              {/* Left half windows */}
              <group position={[
                -(CENTRAL_SCREEN_WIDTH / 2 + windowBayData.halfWidth / 2 + TERRACOTTA_COLUMN_WIDTH * 0.0),
                floorCenterY,
                TOWER_DEPTH / 2 - WINDOW_RECESS_DEPTH / 2 + 0.02 - crownInset
              ]}>
                {/* Recessed glass panel */}
                <mesh material={windowGlassMaterial} renderOrder={5}>
                  <planeGeometry args={[windowBayData.halfWidth - 0.1, windowHeight]} />
                </mesh>
                {/* Vertical mullion bars */}
                {Array.from({ length: windowBayData.bayCount + 1 }, (_, i) => {
                  const x = -windowBayData.halfWidth / 2 + i * windowBayData.bayWidth;
                  return (
                    <mesh
                      key={`lmullion-v-${i}`}
                      position={[x, 0, WINDOW_RECESS_DEPTH / 2 + 0.01]}
                      castShadow
                      material={bronzeTrimMaterial}
                    >
                      <boxGeometry args={[MULLION_BAR_THICKNESS, windowHeight + 0.04, MULLION_BAR_THICKNESS]} />
                    </mesh>
                  );
                })}
                {/* Horizontal mullion bars (top & bottom of window) */}
                {[-windowHeight / 2, windowHeight / 2].map((yOff, i) => (
                  <mesh
                    key={`lmullion-h-${i}`}
                    position={[0, yOff, WINDOW_RECESS_DEPTH / 2 + 0.01]}
                    castShadow
                    material={bronzeTrimMaterial}
                  >
                    <boxGeometry args={[windowBayData.halfWidth, MULLION_BAR_THICKNESS, MULLION_BAR_THICKNESS]} />
                  </mesh>
                ))}
                {/* Mid-height horizontal transom bar */}
                <mesh
                  position={[0, windowHeight * 0.3, WINDOW_RECESS_DEPTH / 2 + 0.01]}
                  castShadow
                  material={bronzeTrimMaterial}
                >
                  <boxGeometry args={[windowBayData.halfWidth, MULLION_BAR_THICKNESS * 0.8, MULLION_BAR_THICKNESS]} />
                </mesh>
              </group>
            </group>
          );
        })}

        {/* ======================================================== */}
        {/* 2. REAL PHYSICAL 180MM SLAB EDGES (Silhouette & Shadows)  */}
        {/* ======================================================== */}
        {floorLevels.map((elevation, idx) => (
          <group key={`slab-${idx}`} position={[0, elevation, 0]}>
            {/* Front Cantilevered Balcony Slab Band */}
            <mesh
              position={[0, -SLAB_THICKNESS / 2, TOWER_DEPTH / 2 + SLAB_OVERHANG / 2]}
              castShadow
              receiveShadow
              material={slabEdgeMaterial}
            >
              <boxGeometry args={[TOWER_WIDTH + 0.3, SLAB_THICKNESS, SLAB_OVERHANG + 0.06]} />
            </mesh>

            {/* Front 40mm Charcoal Drip Edge Fascia */}
            <mesh
              position={[0, -SLAB_THICKNESS + 0.02, TOWER_DEPTH / 2 + SLAB_OVERHANG + 0.04]}
              castShadow
              material={bronzeTrimMaterial}
            >
              <boxGeometry args={[TOWER_WIDTH + 0.32, 0.04, 0.04]} />
            </mesh>

            {/* Side Slab Cantilevers (East & West) */}
            <mesh
              position={[TOWER_WIDTH / 2 + SLAB_OVERHANG / 2, -SLAB_THICKNESS / 2, 0]}
              castShadow
              receiveShadow
              material={slabEdgeMaterial}
            >
              <boxGeometry args={[SLAB_OVERHANG + 0.06, SLAB_THICKNESS, TOWER_DEPTH + 0.2]} />
            </mesh>
            <mesh
              position={[-TOWER_WIDTH / 2 - SLAB_OVERHANG / 2, -SLAB_THICKNESS / 2, 0]}
              castShadow
              receiveShadow
              material={slabEdgeMaterial}
            >
              <boxGeometry args={[SLAB_OVERHANG + 0.06, SLAB_THICKNESS, TOWER_DEPTH + 0.2]} />
            </mesh>

            {/* Rear Floor Drip Groove */}
            <mesh
              position={[0, -SLAB_THICKNESS / 2, -TOWER_DEPTH / 2 - 0.08]}
              castShadow
              receiveShadow
              material={slabEdgeMaterial}
            >
              <boxGeometry args={[TOWER_WIDTH + 0.2, SLAB_THICKNESS, 0.16]} />
            </mesh>

            {/* NEW 6: BALCONY SOFFIT DOWNLIGHTS (under front slab overhang) */}
            {idx > 0 && isDuskOrNight && downlightPositions.map((dx, dIdx) => (
              <mesh
                key={`downlight-${idx}-${dIdx}`}
                position={[dx, -SLAB_THICKNESS - 0.01, TOWER_DEPTH / 2 + SLAB_OVERHANG * 0.6]}
                rotation={[Math.PI / 2, 0, 0]}
                material={downlightMaterial}
              >
                <planeGeometry args={[DOWNLIGHT_SIZE, DOWNLIGHT_SIZE]} />
              </mesh>
            ))}
          </group>
        ))}

        {/* ======================================================== */}
        {/* 2b. FLOOR RAYCAST HITBOXES & TERRACOTTA HIGHLIGHT BANDS  */}
        {/* ======================================================== */}
        {Array.from({ length: RESIDENTIAL_FLOORS }, (_, i) => i + 1).map((f) => {
          const flElevation = PODIUM_HEIGHT + (f - 1) * FLOOR_HEIGHT;
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
                <boxGeometry args={[TOWER_WIDTH + 1.4, FLOOR_HEIGHT, TOWER_DEPTH + 1.4]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>

              {/* Terracotta Glowing Emissive Highlight Ribbon (Module 3) */}
              {isFloorActive && (
                <group position={[0, flElevation + 0.18, 0]}>
                  {/* Perimeter continuous glowing ribbon */}
                  <mesh material={terracottaHighlightMat} renderOrder={14}>
                    <boxGeometry args={[TOWER_WIDTH + 0.82, 0.42, TOWER_DEPTH + 0.82]} />
                  </mesh>

                  {/* Corner architectural vertical glow markers */}
                  <mesh position={[TOWER_WIDTH / 2 + 0.42, FLOOR_HEIGHT / 2 - 0.18, TOWER_DEPTH / 2 + 0.42]} material={terracottaHighlightMat}>
                    <boxGeometry args={[0.08, FLOOR_HEIGHT - 0.24, 0.08]} />
                  </mesh>
                  <mesh position={[-TOWER_WIDTH / 2 - 0.42, FLOOR_HEIGHT / 2 - 0.18, TOWER_DEPTH / 2 + 0.42]} material={terracottaHighlightMat}>
                    <boxGeometry args={[0.08, FLOOR_HEIGHT - 0.24, 0.08]} />
                  </mesh>
                  <mesh position={[TOWER_WIDTH / 2 + 0.42, FLOOR_HEIGHT / 2 - 0.18, -TOWER_DEPTH / 2 - 0.42]} material={terracottaHighlightMat}>
                    <boxGeometry args={[0.08, FLOOR_HEIGHT - 0.24, 0.08]} />
                  </mesh>
                  <mesh position={[-TOWER_WIDTH / 2 - 0.42, FLOOR_HEIGHT / 2 - 0.18, -TOWER_DEPTH / 2 - 0.42]} material={terracottaHighlightMat}>
                    <boxGeometry args={[0.08, FLOOR_HEIGHT - 0.24, 0.08]} />
                  </mesh>
                </group>
              )}
            </group>
          );
        })}

        
        {/* Floor Hover Tooltip (Module 3: "Floor N, X available") */}
        {hoveredFloorNumber !== null && selectedFloorNumber === null && (
          (() => {
            const flData = BUILDING_FLOORS.find((f) => f.floorNumber === hoveredFloorNumber);
            const availCount = flData?.flats.filter((flat) => flat.status === 'AVAILABLE').length ?? 0;
            const flElev = PODIUM_HEIGHT + (hoveredFloorNumber - 1) * FLOOR_HEIGHT + FLOOR_HEIGHT * 0.5;
            return (
              <Html
                position={[0, flElev, TOWER_DEPTH / 2 + 1.8]}
                center
                distanceFactor={36}
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

        {/* Subtle dimming scrim for other floors when a floor is selected (Module 3) */}
        {selectedFloorNumber !== null && (
          <mesh position={[0, TOWER_HEIGHT / 2, 0]} renderOrder={9}>
            <boxGeometry args={[TOWER_WIDTH + 0.35, TOWER_HEIGHT + 0.35, TOWER_DEPTH + 0.35]} />
            <meshBasicMaterial color="#0A0E17" transparent opacity={0.32} depthWrite={false} />
          </mesh>
        )}

        {/* ======================================================== */}
        {/* 3. PHYSICAL GLASS BALUSTRADE RAILINGS & STEEL TOP RAILS  */}
        {/* ======================================================== */}
        {floorLevels.slice(0, RESIDENTIAL_FLOORS).map((elevation, idx) => (
          <group key={`railing-${idx}`} position={[0, elevation, TOWER_DEPTH / 2 + SLAB_OVERHANG + 0.02]}>
            {/* Front Balcony Right Bay (Flat A) */}
            <group position={[6.8, RAILING_HEIGHT / 2, 0]}>
              <mesh material={glassRailingMaterial} renderOrder={10}>
                <planeGeometry args={[7.4, RAILING_HEIGHT]} />
              </mesh>
              {/* Bronze Top Handrail */}
              <mesh position={[0, RAILING_HEIGHT / 2, 0]} material={bronzeTrimMaterial} castShadow>
                <boxGeometry args={[7.42, 0.04, 0.04]} />
              </mesh>
            </group>

            {/* Front Balcony Left Bay (Flat D) */}
            <group position={[-6.8, RAILING_HEIGHT / 2, 0]}>
              <mesh material={glassRailingMaterial} renderOrder={10}>
                <planeGeometry args={[7.4, RAILING_HEIGHT]} />
              </mesh>
              {/* Bronze Top Handrail */}
              <mesh position={[0, RAILING_HEIGHT / 2, 0]} material={bronzeTrimMaterial} castShadow>
                <boxGeometry args={[7.42, 0.04, 0.04]} />
              </mesh>
            </group>

            {/* Side Balcony Returns (East) */}
            <group position={[TOWER_WIDTH / 2 + SLAB_OVERHANG + 0.02, RAILING_HEIGHT / 2, -TOWER_DEPTH / 2 - SLAB_OVERHANG + 4.8]} rotation={[0, Math.PI / 2, 0]}>
              <mesh material={glassRailingMaterial} renderOrder={10}>
                <planeGeometry args={[5.2, RAILING_HEIGHT]} />
              </mesh>
              <mesh position={[0, RAILING_HEIGHT / 2, 0]} material={bronzeTrimMaterial} castShadow>
                <boxGeometry args={[5.22, 0.04, 0.04]} />
              </mesh>
            </group>

            {/* Side Balcony Returns (West) */}
            <group position={[-TOWER_WIDTH / 2 - SLAB_OVERHANG - 0.02, RAILING_HEIGHT / 2, -TOWER_DEPTH / 2 - SLAB_OVERHANG + 4.8]} rotation={[0, -Math.PI / 2, 0]}>
              <mesh material={glassRailingMaterial} renderOrder={10}>
                <planeGeometry args={[5.2, RAILING_HEIGHT]} />
              </mesh>
              <mesh position={[0, RAILING_HEIGHT / 2, 0]} material={bronzeTrimMaterial} castShadow>
                <boxGeometry args={[5.22, 0.04, 0.04]} />
              </mesh>
            </group>
          </group>
        ))}

        {/* ======================================================== */}
        {/* NEW 5: STONE CLADDING BASE (Podium Height)                */}
        {/* Natural stone cladding overlay on the lower 6m             */}
        {/* ======================================================== */}
        <group position={[0, 0, 0]}>
          {/* Front stone cladding */}
          <mesh
            position={[0, PODIUM_HEIGHT / 2, TOWER_DEPTH / 2 + 0.06]}
            castShadow
            receiveShadow
            material={stoneMaterial}
          >
            <boxGeometry args={[TOWER_WIDTH + 0.12, PODIUM_HEIGHT, 0.12]} />
          </mesh>
          {/* Right side stone cladding */}
          <mesh
            position={[TOWER_WIDTH / 2 + 0.06, PODIUM_HEIGHT / 2, 0]}
            castShadow
            receiveShadow
            material={stoneMaterial}
          >
            <boxGeometry args={[0.12, PODIUM_HEIGHT, TOWER_DEPTH + 0.12]} />
          </mesh>
          {/* Left side stone cladding */}
          <mesh
            position={[-TOWER_WIDTH / 2 - 0.06, PODIUM_HEIGHT / 2, 0]}
            castShadow
            receiveShadow
            material={stoneMaterial}
          >
            <boxGeometry args={[0.12, PODIUM_HEIGHT, TOWER_DEPTH + 0.12]} />
          </mesh>
          {/* Rear stone cladding */}
          <mesh
            position={[0, PODIUM_HEIGHT / 2, -TOWER_DEPTH / 2 - 0.06]}
            castShadow
            receiveShadow
            material={stoneMaterial}
          >
            <boxGeometry args={[TOWER_WIDTH + 0.12, PODIUM_HEIGHT, 0.12]} />
          </mesh>
        </group>

        {/* ======================================================== */}
        {/* 4. DOUBLE-HEIGHT LOBBY PODIUM & CANTILEVERED CANOPY      */}
        {/* ======================================================== */}
        <group position={[0, 0, 0]}>
          {/* Grand Cantilevered Entrance Canopy at Y = 4.2m */}
          <group position={[0, 4.2, TOWER_DEPTH / 2 + 1.8]}>
            {/* Canopy Roof Slab */}
            <mesh castShadow receiveShadow material={bronzeTrimMaterial}>
              <boxGeometry args={[13.2, 0.22, 3.8]} />
            </mesh>
            {/* Underside Warm Recessed Emissive Soffit Panel */}
            <mesh position={[0, -0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={canopyLightMaterial}>
              <planeGeometry args={[12.6, 3.4]} />
            </mesh>
            {/* Architectural Stainless Steel Support Rods */}
            <mesh position={[-6.2, 1.2, 0.8]} rotation={[0.45, 0, 0]} material={bronzeTrimMaterial}>
              <cylinderGeometry args={[0.03, 0.03, 2.8, 12]} />
            </mesh>
            <mesh position={[6.2, 1.2, 0.8]} rotation={[0.45, 0, 0]} material={bronzeTrimMaterial}>
              <cylinderGeometry args={[0.03, 0.03, 2.8, 12]} />
            </mesh>
          </group>

          {/* Lobby Ground Entrance Doors & Transom Framing */}
          <group position={[0, 1.6, TOWER_DEPTH / 2 + 0.12]}>
            <mesh castShadow material={bronzeTrimMaterial}>
              <boxGeometry args={[4.2, 3.2, 0.14]} />
            </mesh>
          </group>

          {/* Fluted Limestone Portal Pillars flanking entrance */}
          <mesh position={[-7.2, 3.0, TOWER_DEPTH / 2 + 0.15]} castShadow receiveShadow material={plasterMaterial}>
            <boxGeometry args={[0.8, 6.0, 0.45]} />
          </mesh>
          <mesh position={[7.2, 3.0, TOWER_DEPTH / 2 + 0.15]} castShadow receiveShadow material={plasterMaterial}>
            <boxGeometry args={[0.8, 6.0, 0.45]} />
          </mesh>

          {/* Podium vertical timber/metal louver screen on left side */}
          <group position={[-TOWER_WIDTH / 2 - 0.15, PODIUM_HEIGHT / 2, TOWER_DEPTH / 2 - 2.5]}>
            {Array.from({ length: 12 }, (_, i) => (
              <mesh
                key={`podium-louver-${i}`}
                position={[0, -PODIUM_HEIGHT / 2 + 0.5 + i * 0.45, 0]}
                material={bronzeTrimMaterial}
                castShadow
              >
                <boxGeometry args={[0.08, 0.35, 2.4]} />
              </mesh>
            ))}
          </group>
        </group>

        {/* ======================================================== */}
        {/* NEW 7: STEPPED CROWN (Top 2 Floors Setback)               */}
        {/* Upper floor sets back ~0.5m with extra terracotta cladding */}
        {/* ======================================================== */}
        <group>
          {/* Top floor (floor 14) setback volume — cream plaster inset wall */}
          <mesh
            position={[0, PODIUM_HEIGHT + (RESIDENTIAL_FLOORS - 1) * FLOOR_HEIGHT + FLOOR_HEIGHT / 2, TOWER_DEPTH / 2 - CROWN_SETBACK / 2 + 0.04]}
            castShadow
            receiveShadow
            material={creamPlasterMaterial}
          >
            <boxGeometry args={[TOWER_WIDTH - TERRACOTTA_COLUMN_WIDTH * 2 - 0.2, FLOOR_HEIGHT, 0.08]} />
          </mesh>

          {/* Crown terracotta cladding band wrapping top 2 floors */}
          {/* Front crown band */}
          <mesh
            position={[0, PODIUM_HEIGHT + crownStartFloor * FLOOR_HEIGHT + CROWN_FLOORS * FLOOR_HEIGHT / 2, TOWER_DEPTH / 2 + 0.08]}
            castShadow
            receiveShadow
            material={terracottaColumnMaterial}
          >
            <boxGeometry args={[TOWER_WIDTH + 0.1, 0.25, 0.06]} />
          </mesh>
          {/* Crown terracotta trim at top of parapet level */}
          <mesh
            position={[0, TOWER_HEIGHT - 0.12, TOWER_DEPTH / 2 + 0.08]}
            castShadow
            material={terracottaColumnMaterial}
          >
            <boxGeometry args={[TOWER_WIDTH + 0.1, 0.25, 0.08]} />
          </mesh>

          {/* Side crown terracotta bands */}
          <mesh
            position={[TOWER_WIDTH / 2 + 0.08, PODIUM_HEIGHT + crownStartFloor * FLOOR_HEIGHT + CROWN_FLOORS * FLOOR_HEIGHT / 2, 0]}
            castShadow
            material={terracottaColumnMaterial}
          >
            <boxGeometry args={[0.06, 0.25, TOWER_DEPTH + 0.1]} />
          </mesh>
          <mesh
            position={[-TOWER_WIDTH / 2 - 0.08, PODIUM_HEIGHT + crownStartFloor * FLOOR_HEIGHT + CROWN_FLOORS * FLOOR_HEIGHT / 2, 0]}
            castShadow
            material={terracottaColumnMaterial}
          >
            <boxGeometry args={[0.06, 0.25, TOWER_DEPTH + 0.1]} />
          </mesh>
        </group>

        {/* ======================================================== */}
        {/* 5. ROOFTOP CROWN, PARAPET, LMR & AMENITY PERGOLA         */}
        {/* ======================================================== */}
        <group position={[0, TOWER_HEIGHT, 0]}>
          {/* Solid 1.2m Parapet Wall around perimeter */}
          {/* Front Parapet */}
          <mesh position={[0, PARAPET_HEIGHT / 2, TOWER_DEPTH / 2]} castShadow receiveShadow material={plasterMaterial}>
            <boxGeometry args={[TOWER_WIDTH, PARAPET_HEIGHT, 0.28]} />
          </mesh>
          {/* Rear Parapet */}
          <mesh position={[0, PARAPET_HEIGHT / 2, -TOWER_DEPTH / 2]} castShadow receiveShadow material={plasterMaterial}>
            <boxGeometry args={[TOWER_WIDTH, PARAPET_HEIGHT, 0.28]} />
          </mesh>
          {/* Left Parapet */}
          <mesh position={[-TOWER_WIDTH / 2, PARAPET_HEIGHT / 2, 0]} castShadow receiveShadow material={plasterMaterial}>
            <boxGeometry args={[0.28, PARAPET_HEIGHT, TOWER_DEPTH]} />
          </mesh>
          {/* Right Parapet */}
          <mesh position={[TOWER_WIDTH / 2, PARAPET_HEIGHT / 2, 0]} castShadow receiveShadow material={plasterMaterial}>
            <boxGeometry args={[0.28, PARAPET_HEIGHT, TOWER_DEPTH]} />
          </mesh>

          {/* Coping Stone along Parapet Top — dark charcoal */}
          <mesh position={[0, PARAPET_HEIGHT + 0.03, 0]} castShadow material={bronzeTrimMaterial}>
            <boxGeometry args={[TOWER_WIDTH + 0.15, 0.06, TOWER_DEPTH + 0.15]} />
          </mesh>

          {/* Central Lift Machine Room (LMR) Superstructure */}
          <group position={[0, 1.8, 0]}>
            <mesh castShadow receiveShadow material={plasterMaterial}>
              <boxGeometry args={[7.2, 3.6, 6.0]} />
            </mesh>
            {/* LMR Roof Overhang Slab */}
            <mesh position={[0, 1.85, 0]} castShadow material={bronzeTrimMaterial}>
              <boxGeometry args={[7.6, 0.16, 6.4]} />
            </mesh>
          </group>

          {/* Overhead Water Tank Enclosure with Louvers */}
          <group position={[-5.8, 1.4, -2.4]}>
            <mesh castShadow receiveShadow material={plasterMaterial}>
              <boxGeometry args={[4.4, 2.8, 3.8]} />
            </mesh>
            <mesh position={[0, 1.45, 0]} castShadow material={bronzeTrimMaterial}>
              <boxGeometry args={[4.6, 0.12, 4.0]} />
            </mesh>
          </group>

          {/* Rooftop Pergola Pavilion Structure (Steel beams & timber slats) */}
          <group position={[5.4, 1.5, 2.8]}>
            {/* 4 Corner Steel Columns */}
            <mesh position={[-2.8, 0, -2.2]} castShadow material={bronzeTrimMaterial}>
              <boxGeometry args={[0.16, 3.0, 0.16]} />
            </mesh>
            <mesh position={[2.8, 0, -2.2]} castShadow material={bronzeTrimMaterial}>
              <boxGeometry args={[0.16, 3.0, 0.16]} />
            </mesh>
            <mesh position={[-2.8, 0, 2.2]} castShadow material={bronzeTrimMaterial}>
              <boxGeometry args={[0.16, 3.0, 0.16]} />
            </mesh>
            <mesh position={[2.8, 0, 2.2]} castShadow material={bronzeTrimMaterial}>
              <boxGeometry args={[0.16, 3.0, 0.16]} />
            </mesh>
            {/* Pergola Horizontal Louver Rafters */}
            {[-2.0, -1.2, -0.4, 0.4, 1.2, 2.0].map((rz, i) => (
              <mesh key={`rafter-${i}`} position={[0, 1.52, rz]} castShadow material={bronzeTrimMaterial}>
                <boxGeometry args={[6.2, 0.14, 0.08]} />
              </mesh>
            ))}
          </group>
        </group>
      </group>

      {/* ======================================================== */}
      {/* 6. FLOOR SLICE: SOLID CUT CAP & GHOSTED UPPER MASSING     */}
      {/* ======================================================== */}
      {/* Solid concrete floor plate cap at cut line */}
      <group ref={capRef} position={[0, 100, 0]} visible={false}>
        <mesh position={[0, -0.06, 0]} receiveShadow>
          <boxGeometry args={[TOWER_WIDTH + 0.4, 0.16, TOWER_DEPTH + 0.4]} />
          <meshStandardMaterial color="#EAE5DC" roughness={0.68} />
        </mesh>
        <mesh position={[0, 0.14, 0]} receiveShadow>
          <boxGeometry args={[6.8, 0.26, 5.8]} />
          <meshStandardMaterial color="#3D4046" roughness={0.6} />
        </mesh>
      </group>

      {/* Sliced Floor Interactive Cutaway Plan with 4 Quadrant Units */}
      {isSliced && selectedFloorNumber && (
        <FloorSliceView floorNumber={selectedFloorNumber} />
      )}

      {/* Ghosted Wireframe Upper Massing above the sliced floor */}
      {(isSliced || currentCutY.current < 90.0) && (
        <mesh position={[0, TOWER_HEIGHT / 2, 0]} material={ghostMaterial}>
          <boxGeometry args={[TOWER_WIDTH, TOWER_HEIGHT, TOWER_DEPTH]} />
        </mesh>
      )}
    </group>
  );
};

useTexture.preload(FRONT_ELEVATION_URL);
useTexture.preload(FRONT_EMISSIVE_URL);
useTexture.preload(SIDE_ELEVATION_URL);
useTexture.preload(SIDE_EMISSIVE_URL);
useTexture.preload(PLASTER_NORMAL_URL);
useTexture.preload(PLASTER_ROUGHNESS_URL);
