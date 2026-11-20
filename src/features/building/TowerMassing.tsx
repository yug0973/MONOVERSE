import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
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

interface TowerMassingProps {
  // Optional props
}

/**
 * Senior Architectural Tower Massing (Module 2)
 * - Real G+14 residential tower mass at true architectural proportions
 * - Calibrated UV mapping of orthographic front and side elevation textures
 * - Derived emissive maps for warm glowing dusk windows (bloom on emissive only)
 * - Physical 3D geometry layered over textures:
 *    * 180mm slab edges at each floor with contrasting drip edges
 *    * Continuous glass railing planes (reflective, depthWrite: false) with steel handrails
 *    * Cantilevered double-height lobby canopy at grade
 *    * Solid roof parapet wall, Lift Machine Room (LMR), water tank, and pergola pavilion
 * - Full ?debug=1 hotkey support: Textured -> Pure White Clay -> Wireframe
 * - Retains smooth 600-900ms spring-eased floor slice clipping plane with solid cut cap
 */
export const TowerMassing: React.FC<TowerMassingProps> = () => {
  const {
    viewMode,
    selectedFloorNumber,
    selectFloor,
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

  // Calculate floor elevation levels for geometry loop
  const floorLevels = useMemo(() => {
    const levels: number[] = [];
    for (let f = 1; f <= RESIDENTIAL_FLOORS; f++) {
      levels.push(PODIUM_HEIGHT + (f - 1) * FLOOR_HEIGHT);
    }
    levels.push(TOWER_HEIGHT); // Roof slab level
    return levels;
  }, []);

  // Hide exterior tower when viewing unit dollhouse cutaway or walkthrough
  if (viewMode === 'dollhouse' || viewMode === 'walkthrough') {
    return null;
  }

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
        {/* 2. REAL PHYSICAL 180MM SLAB EDGES (Silhouette & Shadows) */}
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
          </group>
        ))}

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

          {/* Coping Stone along Parapet Top */}
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
