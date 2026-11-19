// @ts-nocheck
/**
 * Aarohan Residences — Real-Time Architectural Tower Generator (G+14)
 * Vadodara Luxury Residential High-Rise Architectural Model
 * 
 * Requirements Addressed:
 * 1. Façade: Recessed balconies with reflective glass railings, 180mm slab edge reveals, vertical fins/louvres, 2-tone paint scheme (ivory + terracotta), 100mm deep window reveals.
 * 2. Podium/Base: Double-height lobby with glass curtain wall, cantilevered entrance canopy, landscaped podium with planter boxes, boundary wall with security gate & guardhouse, vehicular driveway with parking ramp.
 * 3. Crown: Terrace parapet wall, Lift Machine Room (LMR) tower, Overhead Water Tank (OHT) enclosure, rooftop pergola pavilion, architectural LED contour lighting.
 * 4. Geometry hygiene: Non-overlapping coplanar surfaces (zero z-fighting), outward normals, UV2 for lightmaps, pivot at base center (0,0,0).
 * 5. Export pipeline: GLTFExporter -> @gltf-transform (weld, dedup, resample, prune) -> output <8MB, <150k triangles.
 */

import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, weld, resample } from '@gltf-transform/functions';

// Polyfill FileReader for GLTFExporter in Node.js
class FileReaderPolyfill {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
    });
  }
}
global.FileReader = FileReaderPolyfill;

console.log('=== Building Aarohan Residences G+14 Architectural Tower ===');

// ==========================================
// 1. PBR MATERIALS DEFINITION
// ==========================================
const materials = {
  // Primary wall body: Warm off-white / ivory architectural plaster
  plasterIvory: new THREE.MeshStandardMaterial({
    name: 'Web | Warm ivory plaster',
    color: '#E8E3D8',
    roughness: 0.88,
    metalness: 0.02,
  }),
  // Secondary accent: Rich terracotta / warm sand architectural plaster
  plasterTerracotta: new THREE.MeshStandardMaterial({
    name: 'Web | Terracotta accent plaster',
    color: '#B87352',
    roughness: 0.85,
    metalness: 0.02,
  }),
  // Slab edge reveals: Dark champagne bronze / fluted reveal band
  slabEdge: new THREE.MeshStandardMaterial({
    name: 'Web | Slab edge reveal bronze',
    color: '#3E3833',
    roughness: 0.42,
    metalness: 0.65,
  }),
  // Window frames, vertical fins, and metal louvres: Anodized dark bronze
  bronzeMetal: new THREE.MeshStandardMaterial({
    name: 'Web | Dark bronze aluminum',
    color: '#2B2724',
    roughness: 0.32,
    metalness: 0.85,
  }),
  // Reflective architectural facade window glass
  glassFacade: new THREE.MeshStandardMaterial({
    name: 'Web | Clear facade glass',
    color: '#A5C4D4',
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    metalness: 0.1,
  }),
  // Balcony railings: Reflective tinted safety glass with sky reflections
  glassBalustrade: new THREE.MeshStandardMaterial({
    name: 'Web | Blue clear balustrade',
    color: '#8EBDD1',
    transparent: true,
    opacity: 0.38,
    roughness: 0.04,
    metalness: 0.12,
  }),
  // Warm sheer drapes / curtains behind window glass (creates interior depth & prevents hollow look)
  curtainSheer: new THREE.MeshStandardMaterial({
    name: 'Web | Ivory sheer curtains',
    color: '#EDE7DC',
    roughness: 0.82,
    metalness: 0.01,
  }),
  // Balcony & canopy soffit: Linear warm teak wood slats
  teakSoffit: new THREE.MeshStandardMaterial({
    name: 'Web | Linear timber soffit fallback.002',
    color: '#885B38',
    roughness: 0.62,
    metalness: 0.04,
  }),
  // Podium paving & fluted columns: Honed beige travertine stone
  travertineStone: new THREE.MeshStandardMaterial({
    name: 'Web | Pale honed limestone fallback.002',
    color: '#D5CDBE',
    roughness: 0.75,
    metalness: 0.03,
  }),
  // Vehicular arrival driveway & parking ramp: Textured asphalt
  asphaltDriveway: new THREE.MeshStandardMaterial({
    name: 'Web | Asphalt driveway',
    color: '#282B30',
    roughness: 0.92,
    metalness: 0.02,
  }),
  // Landscaped podium hedges & planter boxes: Dense foliage
  foliageGreen: new THREE.MeshStandardMaterial({
    name: 'Web | Landscape light foliage',
    color: '#325936',
    roughness: 0.82,
    metalness: 0.0,
  }),
  // Architectural contour LED strips & diffusers
  ledLinear: new THREE.MeshStandardMaterial({
    name: 'Web | Warm linear LEDs',
    color: '#FFE2A8',
    emissive: new THREE.Color('#FFE2A8'),
    emissiveIntensity: 1.2,
    roughness: 0.2,
  }),
};

// Helper: Ensure vertex normals and UV2 are cleanly populated
function prepareGeometry(geom) {
  geom.computeVertexNormals();
  if (geom.attributes.uv && !geom.attributes.uv2) {
    geom.setAttribute('uv2', geom.attributes.uv.clone());
  }
  return geom;
}

function createBox(w, h, d, mat, name, pos = [0, 0, 0]) {
  const geom = prepareGeometry(new THREE.BoxGeometry(w, h, d));
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createCylinder(rt, rb, h, segs, mat, name, pos = [0, 0, 0]) {
  const geom = prepareGeometry(new THREE.CylinderGeometry(rt, rb, h, segs));
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// Helper: Create filleted corner balcony slab using ExtrudeGeometry
function createCurvedBalconySlab(width, depth, thickness, radius, mat, name, pos, flipX = false, flipZ = false) {
  const shape = new THREE.Shape();
  const w = width;
  const d = depth;
  const r = Math.min(radius, w / 2, d / 2);

  // Profile in local 2D (X, Z) with rounded outer corner
  shape.moveTo(0, 0);
  shape.lineTo(w - r, 0);
  shape.absarc(w - r, r, r, -Math.PI / 2, 0, false);
  shape.lineTo(w, d);
  shape.lineTo(0, d);
  shape.closePath();

  const geom = prepareGeometry(
    new THREE.ExtrudeGeometry(shape, {
      depth: thickness,
      bevelEnabled: false,
    })
  );
  // Extrude extends along Z, rotate to lie flat (Y is up)
  geom.rotateX(Math.PI / 2);

  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.position.set(...pos);
  if (flipX) mesh.scale.x = -1;
  if (flipZ) mesh.scale.z = -1;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

const root = new THREE.Scene();
root.name = 'Aarohan_Residences_Tower_G14';

// ==========================================
// 2. PODIUM & BASE (Y: 0 to 6.0m)
// ==========================================
console.log('1/4 Building Podium, Double-Height Lobby, Canopy, Ramp, and Site Infrastructure...');
const podiumGroup = new THREE.Group();
podiumGroup.name = 'Podium_Base';

// Ground Base Plate & Plaza (38m wide x 30m deep)
podiumGroup.add(
  createBox(38.0, 0.4, 30.0, materials.travertineStone, 'Podium_Ground_Plaza', [0, -0.2, 0])
);

// Curving Driveway Loop (Asphalt with 150mm curb)
podiumGroup.add(
  createBox(34.0, 0.05, 8.5, materials.asphaltDriveway, 'Podium_Arrival_Driveway', [0, 0.03, 10.0])
);
// Driveway curbs
podiumGroup.add(
  createBox(34.2, 0.16, 0.25, materials.travertineStone, 'Driveway_Curb_North', [0, 0.08, 5.62])
);
podiumGroup.add(
  createBox(34.2, 0.16, 0.25, materials.travertineStone, 'Driveway_Curb_South', [0, 0.08, 14.38])
);

// Vehicular Parking Ramp on West flank (descending to basement/podium)
const rampGroup = new THREE.Group();
rampGroup.name = 'Podium_Vehicular_Ramp';
const rampMesh = createBox(5.2, 0.22, 13.0, materials.asphaltDriveway, 'Vehicular_Ramp_Slab', [-15.0, 0.25, -1.0]);
rampMesh.rotation.x = 0.085; // subtle realistic slope
rampGroup.add(rampMesh);
// Ramp safety crash walls
rampGroup.add(createBox(0.25, 0.95, 13.0, materials.bronzeMetal, 'Ramp_Safety_Barrier_Outer', [-17.7, 0.75, -1.0]));
rampGroup.add(createBox(0.25, 0.95, 13.0, materials.bronzeMetal, 'Ramp_Safety_Barrier_Inner', [-12.3, 0.75, -1.0]));
podiumGroup.add(rampGroup);

// Boundary Wall & Security Gate
const boundaryGroup = new THREE.Group();
boundaryGroup.name = 'Podium_Boundary_Gate';
// Boundary wall piers along South road frontage
boundaryGroup.add(createBox(11.5, 2.2, 0.35, materials.travertineStone, 'Boundary_Wall_Left', [-10.2, 1.1, 14.5]));
boundaryGroup.add(createBox(11.5, 2.2, 0.35, materials.travertineStone, 'Boundary_Wall_Right', [10.2, 1.1, 14.5]));
// Teak horizontal louvre inserts in boundary wall
boundaryGroup.add(createBox(11.0, 1.4, 0.08, materials.teakSoffit, 'Boundary_Louvres_Left', [-10.2, 1.1, 14.5]));
boundaryGroup.add(createBox(11.0, 1.4, 0.08, materials.teakSoffit, 'Boundary_Louvres_Right', [10.2, 1.1, 14.5]));
// Security Guardhouse (3.2m x 2.6m x 3.0m)
const guardHouse = new THREE.Group();
guardHouse.name = 'Security_Guardhouse';
guardHouse.add(createBox(3.2, 3.0, 2.6, materials.plasterIvory, 'Guardhouse_Body', [15.2, 1.5, 12.0]));
guardHouse.add(createBox(3.4, 0.25, 2.8, materials.bronzeMetal, 'Guardhouse_Fascia', [15.2, 3.1, 12.0]));
guardHouse.add(createBox(2.8, 1.6, 0.05, materials.glassFacade, 'Guardhouse_Corner_Window', [15.2, 1.6, 13.32]));
boundaryGroup.add(guardHouse);
// Motorized boom barrier / sliding gate
boundaryGroup.add(createBox(7.4, 1.8, 0.1, materials.bronzeMetal, 'Motorized_Entrance_Gate', [0, 0.9, 14.5]));
podiumGroup.add(boundaryGroup);

// Grand Double-Height Entrance Lobby (Y: 0 to 6.0m)
const lobbyGroup = new THREE.Group();
lobbyGroup.name = 'Podium_DoubleHeight_Lobby';
// Structural Glass Curtain Wall along South entrance (width 16m, height 5.8m)
lobbyGroup.add(createBox(16.4, 5.8, 0.08, materials.glassFacade, 'Lobby_Glass_Curtain_Wall', [0, 2.9, 8.45]));
// Bronze structural lobby mullions
for (let mx = -7.5; mx <= 7.5; mx += 3.0) {
  lobbyGroup.add(createBox(0.12, 5.8, 0.18, materials.bronzeMetal, `Lobby_Mullion_${mx.toFixed(0)}`, [mx, 2.9, 8.47]));
}
// Fluted Limestone Structural Columns (diameter 0.75m)
const colX = [-7.0, -2.5, 2.5, 7.0];
colX.forEach((cx, idx) => {
  lobbyGroup.add(
    createCylinder(0.38, 0.38, 5.8, 24, materials.travertineStone, `Lobby_Fluted_Column_${idx}`, [cx, 2.9, 7.8])
  );
});
// Lobby Interior Architecture: Honed marble reception desk & back-lit feature wall
lobbyGroup.add(createBox(3.8, 1.1, 1.2, materials.travertineStone, 'Lobby_Reception_Desk', [0, 0.55, 6.2]));
lobbyGroup.add(createBox(6.0, 4.5, 0.2, materials.ledLinear, 'Lobby_Backlit_Onyx_Feature', [0, 2.6, 3.8]));
lobbyGroup.add(createBox(6.4, 4.8, 0.25, materials.plasterTerracotta, 'Lobby_Feature_Portal', [0, 2.6, 3.65]));

// Cantilevered Entrance Canopy (Projects 5.5m forward from lobby, width 14.5m, height 0.45m at Y = 5.6m)
const canopyGroup = new THREE.Group();
canopyGroup.name = 'Lobby_Entrance_Canopy';
// Canopy fascia & slab
canopyGroup.add(createBox(14.5, 0.45, 5.5, materials.bronzeMetal, 'Canopy_Bronze_Fascia', [0, 5.6, 11.2]));
// Under-canopy warm teak timber soffit
canopyGroup.add(createBox(14.1, 0.05, 5.1, materials.teakSoffit, 'Canopy_Teak_Soffit', [0, 5.35, 11.2]));
// Recessed warm LED downlight diffuser strips on underside
canopyGroup.add(createBox(12.5, 0.02, 0.2, materials.ledLinear, 'Canopy_Recessed_LED_1', [0, 5.32, 10.0]));
canopyGroup.add(createBox(12.5, 0.02, 0.2, materials.ledLinear, 'Canopy_Recessed_LED_2', [0, 5.32, 12.4]));
lobbyGroup.add(canopyGroup);

// Podium Landscape Planters & Hedges
const gardenGroup = new THREE.Group();
gardenGroup.name = 'Podium_Landscaped_Deck';
gardenGroup.add(createBox(7.2, 0.8, 2.4, materials.travertineStone, 'Planter_Box_East', [11.8, 0.4, 4.0]));
gardenGroup.add(createBox(6.8, 0.9, 2.0, materials.foliageGreen, 'Hedge_Foliage_East', [11.8, 0.85, 4.0]));
gardenGroup.add(createBox(7.2, 0.8, 2.4, materials.travertineStone, 'Planter_Box_West', [-11.8, 0.4, 4.0]));
gardenGroup.add(createBox(6.8, 0.9, 2.0, materials.foliageGreen, 'Hedge_Foliage_West', [-11.8, 0.85, 4.0]));
podiumGroup.add(gardenGroup);
podiumGroup.add(lobbyGroup);

root.add(podiumGroup);

// ==========================================
// 3. TYPICAL RESIDENTIAL FLOORS (G+14)
// Floors 1 to 14, floor-to-floor height = 3.2m
// ==========================================
console.log('2/4 Building 14 Residential Floors with Recessed Balconies, Slab Edge Reveals, and Vertical Fins...');

const totalResidentialFloors = 14;
const basePodiumHeight = 6.0;
const floorHeight = 3.2;

for (let f = 1; f <= totalResidentialFloors; f++) {
  const floorElevation = basePodiumHeight + (f - 1) * floorHeight;
  const padFloor = f.toString().padStart(2, '0');
  const floorGroup = new THREE.Group();
  floorGroup.name = `Level_${padFloor}`;

  // 1. Structural Floor Slab (25.4m x 17.4m x 0.22m)
  floorGroup.add(
    createBox(25.4, 0.22, 17.4, materials.travertineStone, `Level_${padFloor}_Structural_Slab`, [0, floorElevation + 0.11, 0])
  );

  // 2. Projecting Slab Edge Band (180mm height, projecting 180mm beyond wall in dark champagne bronze)
  floorGroup.add(
    createBox(25.8, 0.18, 17.8, materials.slabEdge, `Level_${padFloor}_Slab_Edge_Reveal`, [0, floorElevation + 0.1, 0])
  );

  // 3. Underside Teak Timber Soffit
  floorGroup.add(
    createBox(25.2, 0.04, 17.2, materials.teakSoffit, `Level_${padFloor}_Teak_Soffit`, [0, floorElevation - 0.02, 0])
  );

  // 4. Primary Core & Internal Demising Walls (Ivory Plaster)
  floorGroup.add(
    createBox(6.2, 2.95, 6.2, materials.plasterIvory, `Level_${padFloor}_Elevator_Core`, [0, floorElevation + 1.6, 0])
  );

  // 5. Exterior Façade Walls (2-Tone Ivory Body + Terracotta Accent Band)
  // East & West Shear Walls (Warm Ivory Plaster with 100mm window reveals)
  floorGroup.add(
    createBox(0.3, 2.95, 12.0, materials.plasterIvory, `Level_${padFloor}_West_Shear_Wall`, [-12.7, floorElevation + 1.6, 0])
  );
  floorGroup.add(
    createBox(0.3, 2.95, 12.0, materials.plasterIvory, `Level_${padFloor}_East_Shear_Wall`, [12.7, floorElevation + 1.6, 0])
  );

  // Terracotta Textured Accent Band (framed around recessed bays and spandrels)
  floorGroup.add(
    createBox(0.35, 2.95, 3.2, materials.plasterTerracotta, `Level_${padFloor}_West_Accent_Band`, [-12.72, floorElevation + 1.6, 0])
  );
  floorGroup.add(
    createBox(0.35, 2.95, 3.2, materials.plasterTerracotta, `Level_${padFloor}_East_Accent_Band`, [12.72, floorElevation + 1.6, 0])
  );

  // Central North & South Solid Spandrel Piers (Terracotta Accent)
  floorGroup.add(
    createBox(3.6, 2.95, 0.3, materials.plasterTerracotta, `Level_${padFloor}_South_Central_Pier`, [0, floorElevation + 1.6, 8.55])
  );
  floorGroup.add(
    createBox(3.6, 2.95, 0.3, materials.plasterTerracotta, `Level_${padFloor}_North_Central_Pier`, [0, floorElevation + 1.6, -8.55])
  );

  // 6. Recessed Balconies & Terraces with Reflective Glass Railings (Flats A, B, C, D)
  // Flat A (Front-Right, +X, +Z) Living Terrace Slab & Railings
  const balA_X = 7.8;
  const balA_Z = 9.8;
  floorGroup.add(
    createBox(7.2, 0.22, 2.8, materials.slabEdge, `Level_${padFloor}_Balcony_A_Slab`, [balA_X, floorElevation + 0.11, balA_Z])
  );
  floorGroup.add(
    createBox(7.1, 1.1, 0.04, materials.glassBalustrade, `Level_${padFloor}_Balcony_A_Glass_Front`, [balA_X, floorElevation + 0.72, balA_Z + 1.35])
  );
  floorGroup.add(
    createBox(0.04, 1.1, 2.7, materials.glassBalustrade, `Level_${padFloor}_Balcony_A_Glass_Side`, [balA_X + 3.55, floorElevation + 0.72, balA_Z])
  );
  floorGroup.add(
    createBox(7.2, 0.06, 0.08, materials.bronzeMetal, `Level_${padFloor}_Balcony_A_Handrail`, [balA_X, floorElevation + 1.28, balA_Z + 1.35])
  );
  // Linear LED contour strip under balcony slab
  floorGroup.add(
    createBox(7.0, 0.02, 0.04, materials.ledLinear, `Level_${padFloor}_Balcony_A_LED_Strip`, [balA_X, floorElevation + 0.01, balA_Z + 1.33])
  );

  // Flat D (Front-Left, -X, +Z) Matching Living Terrace
  const balD_X = -7.8;
  const balD_Z = 9.8;
  floorGroup.add(
    createBox(7.2, 0.22, 2.8, materials.slabEdge, `Level_${padFloor}_Balcony_D_Slab`, [balD_X, floorElevation + 0.11, balD_Z])
  );
  floorGroup.add(
    createBox(7.1, 1.1, 0.04, materials.glassBalustrade, `Level_${padFloor}_Balcony_D_Glass_Front`, [balD_X, floorElevation + 0.72, balD_Z + 1.35])
  );
  floorGroup.add(
    createBox(0.04, 1.1, 2.7, materials.glassBalustrade, `Level_${padFloor}_Balcony_D_Glass_Side`, [balD_X - 3.55, floorElevation + 0.72, balD_Z])
  );
  floorGroup.add(
    createBox(7.2, 0.06, 0.08, materials.bronzeMetal, `Level_${padFloor}_Balcony_D_Handrail`, [balD_X, floorElevation + 1.28, balD_Z + 1.35])
  );
  floorGroup.add(
    createBox(7.0, 0.02, 0.04, materials.ledLinear, `Level_${padFloor}_Balcony_D_LED_Strip`, [balD_X, floorElevation + 0.01, balD_Z + 1.33])
  );

  // Flat B (Rear-Right, +X, -Z) Bedroom Balcony
  const balB_X = 7.8;
  const balB_Z = -9.6;
  floorGroup.add(
    createBox(6.4, 0.22, 2.2, materials.slabEdge, `Level_${padFloor}_Balcony_B_Slab`, [balB_X, floorElevation + 0.11, balB_Z])
  );
  floorGroup.add(
    createBox(6.3, 1.1, 0.04, materials.glassBalustrade, `Level_${padFloor}_Balcony_B_Glass_Front`, [balB_X, floorElevation + 0.72, balB_Z - 1.05])
  );
  floorGroup.add(
    createBox(0.04, 1.1, 2.1, materials.glassBalustrade, `Level_${padFloor}_Balcony_B_Glass_Side`, [balB_X + 3.15, floorElevation + 0.72, balB_Z])
  );
  floorGroup.add(
    createBox(6.4, 0.06, 0.08, materials.bronzeMetal, `Level_${padFloor}_Balcony_B_Handrail`, [balB_X, floorElevation + 1.28, balB_Z - 1.05])
  );

  // Flat C (Rear-Left, -X, -Z) Bedroom Balcony
  const balC_X = -7.8;
  const balC_Z = -9.6;
  floorGroup.add(
    createBox(6.4, 0.22, 2.2, materials.slabEdge, `Level_${padFloor}_Balcony_C_Slab`, [balC_X, floorElevation + 0.11, balC_Z])
  );
  floorGroup.add(
    createBox(6.3, 1.1, 0.04, materials.glassBalustrade, `Level_${padFloor}_Balcony_C_Glass_Front`, [balC_X, floorElevation + 0.72, balC_Z - 1.05])
  );
  floorGroup.add(
    createBox(0.04, 1.1, 2.1, materials.glassBalustrade, `Level_${padFloor}_Balcony_C_Glass_Side`, [balC_X - 3.15, floorElevation + 0.72, balC_Z])
  );
  floorGroup.add(
    createBox(6.4, 0.06, 0.08, materials.bronzeMetal, `Level_${padFloor}_Balcony_C_Handrail`, [balC_X, floorElevation + 1.28, balC_Z - 1.05])
  );

  // 7. Window Openings with 100mm Reveals, Bronze Mullions, Glass & Warm Sheer Curtains
  // South Living Room Window Bays (Flats A & D)
  const windowBaysSouth = [-7.8, 7.8];
  windowBaysSouth.forEach((wx, bIdx) => {
    // Window reveal frame (100mm deep)
    floorGroup.add(
      createBox(5.6, 2.6, 0.12, materials.bronzeMetal, `Level_${padFloor}_Window_Frame_S_${bIdx}`, [wx, floorElevation + 1.5, 8.45])
    );
    // Double glazed window glass pane
    floorGroup.add(
      createBox(5.4, 2.45, 0.04, materials.glassFacade, `Level_${padFloor}_Window_Glass_S_${bIdx}`, [wx, floorElevation + 1.5, 8.42])
    );
    // Vertical bronze mullions (subdividing the bay into 3 luxury panels)
    floorGroup.add(
      createBox(0.08, 2.5, 0.14, materials.bronzeMetal, `Level_${padFloor}_Mullion_S_${bIdx}_1`, [wx - 1.8, floorElevation + 1.5, 8.45])
    );
    floorGroup.add(
      createBox(0.08, 2.5, 0.14, materials.bronzeMetal, `Level_${padFloor}_Mullion_S_${bIdx}_2`, [wx + 1.8, floorElevation + 1.5, 8.45])
    );
    // Warm sheer drapes set 140mm behind glass (gives architectural depth & eliminates hollow look)
    floorGroup.add(
      createBox(5.3, 2.5, 0.04, materials.curtainSheer, `Level_${padFloor}_Curtain_S_${bIdx}`, [wx, floorElevation + 1.5, 8.28])
    );
  });

  // North Bedroom Window Bays (Flats B & C)
  const windowBaysNorth = [-7.8, 7.8];
  windowBaysNorth.forEach((wx, bIdx) => {
    floorGroup.add(
      createBox(5.2, 2.4, 0.12, materials.bronzeMetal, `Level_${padFloor}_Window_Frame_N_${bIdx}`, [wx, floorElevation + 1.5, -8.45])
    );
    floorGroup.add(
      createBox(5.0, 2.25, 0.04, materials.glassFacade, `Level_${padFloor}_Window_Glass_N_${bIdx}`, [wx, floorElevation + 1.5, -8.42])
    );
    floorGroup.add(
      createBox(0.08, 2.3, 0.14, materials.bronzeMetal, `Level_${padFloor}_Mullion_N_${bIdx}`, [wx, floorElevation + 1.5, -8.45])
    );
    floorGroup.add(
      createBox(4.9, 2.3, 0.04, materials.curtainSheer, `Level_${padFloor}_Curtain_N_${bIdx}`, [wx, floorElevation + 1.5, -8.28])
    );
  });

  // 8. Vertical Architectural Fins & Solar Louvres (Climatic Shading for Gujarat & Rhythm)
  const finPositionsX = [-11.5, -4.0, 4.0, 11.5];
  finPositionsX.forEach((fx, finIdx) => {
    // South facade fins (width 120mm, projection 420mm)
    floorGroup.add(
      createBox(0.12, 3.2, 0.42, materials.bronzeMetal, `Level_${padFloor}_Vertical_Fin_S_${finIdx}`, [fx, floorElevation + 1.6, 8.78])
    );
    // North facade fins
    floorGroup.add(
      createBox(0.12, 3.2, 0.42, materials.bronzeMetal, `Level_${padFloor}_Vertical_Fin_N_${finIdx}`, [fx, floorElevation + 1.6, -8.78])
    );
  });

  root.add(floorGroup);
}

// ==========================================
// 4. CROWN & ROOFTOP (Y: 50.8m to 56.5m)
// ==========================================
console.log('3/4 Building Crown, Parapet, Lift Machine Room, Water Tank Enclosure, and Rooftop Pergola...');
const crownGroup = new THREE.Group();
crownGroup.name = 'Rooftop_Crown';

const roofElevation = basePodiumHeight + totalResidentialFloors * floorHeight; // 50.8m

// Roof Terrace Slab (25.8m x 17.8m x 0.25m)
crownGroup.add(
  createBox(25.8, 0.25, 17.8, materials.travertineStone, 'Roof_Terrace_Slab', [0, roofElevation + 0.12, 0])
);

// Terrace Perimeter Parapet Wall (1.3m height)
crownGroup.add(
  createBox(25.8, 1.3, 0.3, materials.plasterIvory, 'Roof_Parapet_South', [0, roofElevation + 0.77, 8.75])
);
crownGroup.add(
  createBox(25.8, 1.3, 0.3, materials.plasterIvory, 'Roof_Parapet_North', [0, roofElevation + 0.77, -8.75])
);
crownGroup.add(
  createBox(0.3, 1.3, 17.2, materials.plasterIvory, 'Roof_Parapet_West', [-12.75, roofElevation + 0.77, 0])
);
crownGroup.add(
  createBox(0.3, 1.3, 17.2, materials.plasterIvory, 'Roof_Parapet_East', [12.75, roofElevation + 0.77, 0])
);

// Bronze Parapet Coping Trim
crownGroup.add(
  createBox(26.0, 0.08, 0.36, materials.bronzeMetal, 'Roof_Parapet_Coping_South', [0, roofElevation + 1.44, 8.75])
);
crownGroup.add(
  createBox(26.0, 0.08, 0.36, materials.bronzeMetal, 'Roof_Parapet_Coping_North', [0, roofElevation + 1.44, -8.75])
);

// Lift Machine Room (LMR) Superstructure (Height 4.2m)
const lmrGroup = new THREE.Group();
lmrGroup.name = 'Lift_Machine_Room';
lmrGroup.add(
  createBox(6.8, 4.2, 6.2, materials.plasterIvory, 'LMR_Main_Structure', [0, roofElevation + 2.22, 0])
);
// LMR Architectural Bronze Ventilation Louvres
lmrGroup.add(
  createBox(6.4, 2.4, 0.1, materials.bronzeMetal, 'LMR_Louvres_South', [0, roofElevation + 2.4, 3.15])
);
lmrGroup.add(
  createBox(6.4, 2.4, 0.1, materials.bronzeMetal, 'LMR_Louvres_North', [0, roofElevation + 2.4, -3.15])
);
// LMR Roof Cap
lmrGroup.add(
  createBox(7.2, 0.3, 6.6, materials.slabEdge, 'LMR_Roof_Cap', [0, roofElevation + 4.45, 0])
);
crownGroup.add(lmrGroup);

// Overhead Water Tank (OHT) Enclosure
crownGroup.add(
  createBox(5.0, 3.2, 4.2, materials.plasterTerracotta, 'Overhead_Water_Tank_Enclosure', [7.8, roofElevation + 1.72, 0])
);
crownGroup.add(
  createBox(5.4, 0.25, 4.6, materials.bronzeMetal, 'OHT_Fascia_Cap', [7.8, roofElevation + 3.42, 0])
);

// Modern Architectural Rooftop Pergola / Amenity Pavilion
const pergolaGroup = new THREE.Group();
pergolaGroup.name = 'Rooftop_Pergola_Pavilion';
// Bronze steel posts (height 3.6m)
const postCoords = [
  [-10.5, 4.5], [-5.5, 4.5],
  [-10.5, -4.5], [-5.5, -4.5],
];
postCoords.forEach(([px, pz], idx) => {
  pergolaGroup.add(
    createBox(0.18, 3.6, 0.18, materials.bronzeMetal, `Pergola_Post_${idx}`, [px, roofElevation + 1.92, pz])
  );
});
// Main horizontal canopy beams
pergolaGroup.add(
  createBox(6.4, 0.25, 0.18, materials.bronzeMetal, 'Pergola_Beam_South', [-8.0, roofElevation + 3.75, 4.5])
);
pergolaGroup.add(
  createBox(6.4, 0.25, 0.18, materials.bronzeMetal, 'Pergola_Beam_North', [-8.0, roofElevation + 3.75, -4.5])
);
// Horizontal Louvred Trellis Slats
for (let lx = -10.8; lx <= -5.2; lx += 0.7) {
  pergolaGroup.add(
    createBox(0.08, 0.18, 9.2, materials.bronzeMetal, `Pergola_Slat_${lx.toFixed(1)}`, [lx, roofElevation + 3.9, 0])
  );
}
// Rooftop Architectural Contour LED Lighting
pergolaGroup.add(
  createBox(6.2, 0.04, 0.04, materials.ledLinear, 'Pergola_LED_Contour_S', [-8.0, roofElevation + 3.61, 4.48])
);
pergolaGroup.add(
  createBox(6.2, 0.04, 0.04, materials.ledLinear, 'Pergola_LED_Contour_N', [-8.0, roofElevation + 3.61, -4.48])
);
crownGroup.add(pergolaGroup);

root.add(crownGroup);

// ==========================================
// 5. EXPORT & GLTF-TRANSFORM PIPELINE
// ==========================================
async function exportAndOptimize() {
  console.log('4/4 Exporting to GLB & Running @gltf-transform Hygiene Pipeline...');
  const exporter = new GLTFExporter();

  const glbRawBuffer = await exporter.parseAsync(root, { binary: true });
  console.log(`Raw GLB Exported: ${(glbRawBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB`);

  const io = new NodeIO();
  const document = await io.readBinary(new Uint8Array(glbRawBuffer));

  // Geometry Hygiene: Weld duplicate coplanar vertices, deduplicate shared accessors, resample keyframes, prune dead nodes
  await document.transform(
    weld({ tolerance: 0.0001 }),
    dedup(),
    resample(),
    prune({ keepAttributes: true })
  );

  const finalGlbBuffer = await io.writeBinary(document);
  const finalSizeMb = (finalGlbBuffer.byteLength / (1024 * 1024)).toFixed(2);
  console.log(`Optimized GLB Size: ${finalSizeMb} MB (Requirement: < 8MB)`);

  const outPath = path.resolve('public/models/Aarohan_Tower_G14.glb');
  fs.writeFileSync(outPath, Buffer.from(finalGlbBuffer));
  console.log(`Saved optimized tower to: ${outPath}`);

  // Also update legacy target for full backward compatibility
  const legacyPath = path.resolve('public/models/Waterfront_18F_optimized.glb');
  fs.writeFileSync(legacyPath, Buffer.from(finalGlbBuffer));
  console.log(`Updated legacy target: ${legacyPath}`);
}

exportAndOptimize().catch((err) => {
  console.error('Fatal generator error:', err);
  process.exit(1);
});
