/**
 * Photorealistic 3D Model Generator: HEAVEN Luxury Residential Building (G+9)
 * Replicates uploaded reference image (media_1795349424333_9678651c.jpg) with true 3D geometry:
 * - G+9 storeys (Ground Stilt + 9 Residential Floors + Crown Pergola with Circular Cutouts)
 * - Central white stucco pier with dual punch window columns & winged "HEAVEN" crest
 * - Continuous vertical warm teak wood louvers flanking the central pier
 * - Cantilevered left & right balcony stacks with white fascia bands and black/glass balustrades
 * - Dark slate-gray architectural side shear walls with recessed window bays
 * - Ground floor stilt lobby, "OUT" gate portal, boundary wall, security cabin, sidewalk, and street
 * - Fully manifold PBR geometry exported to GLB via @gltf-transform
 */

import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { NodeIO } from '@gltf-transform/core';
import { weld, dedup, resample, prune } from '@gltf-transform/functions';

class FileReaderPolyfill {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      if (this.onloadend) this.onloadend();
    });
  }
}
globalThis.FileReader = FileReaderPolyfill;

console.log('--- Generating Photorealistic 3D Model: HEAVEN Building ---');

// ==========================================
// 1. DIMENSIONS & PROPORTIONS
// ==========================================
const TOWER_WIDTH = 18.0;   // Transverse width (X: -9.0 to +9.0)
const TOWER_DEPTH = 16.0;   // Longitudinal depth (Z: -8.0 to +8.0)
const GROUND_HEIGHT = 3.8;  // Ground stilt floor height
const RESIDENTIAL_FLOORS = 9;
const FLOOR_HEIGHT = 3.1;   // Floor-to-floor height per floor
const ROOF_ELEVATION = GROUND_HEIGHT + RESIDENTIAL_FLOORS * FLOOR_HEIGHT; // 3.8 + 27.9 = 31.7m
const SLAB_THICKNESS = 0.22;
const BALCONY_PROJECTION = 2.4;
const CENTRAL_PIER_WIDTH = 5.4; // X: -2.7 to +2.7
const LOUVER_WIDTH = 0.7;       // X: -3.4 to -2.7 and +2.7 to +3.4

// ==========================================
// 2. ARCHITECTURAL PBR MATERIALS
// ==========================================
const materials = {
  // Pure White Stucco (Central pier, horizontal balcony fascia bands, entrance portal)
  whiteStucco: new THREE.MeshStandardMaterial({
    name: 'heaven_white_stucco',
    color: '#F5F4F0',
    roughness: 0.85,
    metalness: 0.02,
  }),

  // Slate Gray Architectural Concrete (Side shear walls, balcony returns)
  slateGray: new THREE.MeshStandardMaterial({
    name: 'heaven_slate_gray',
    color: '#484D55',
    roughness: 0.80,
    metalness: 0.04,
  }),

  // Dark Charcoal / Black Aluminum (Window mullions, railings, pergolas, gates)
  charcoalMetal: new THREE.MeshStandardMaterial({
    name: 'heaven_charcoal_metal',
    color: '#202226',
    roughness: 0.35,
    metalness: 0.85,
  }),

  // Warm Teak Timber (Vertical louver fins, stilt ceiling accents)
  teakWood: new THREE.MeshStandardMaterial({
    name: 'heaven_teak_wood',
    color: '#9E6534',
    roughness: 0.55,
    metalness: 0.05,
  }),

  // Transparent Clear Glass (Balcony balustrades)
  glassClear: new THREE.MeshStandardMaterial({
    name: 'heaven_glass_clear',
    color: '#D2E2EE',
    roughness: 0.04,
    metalness: 0.12,
    transparent: true,
    opacity: 0.30,
    depthWrite: false,
  }),

  // Reflective Window Glass (Facade windows)
  glassWindow: new THREE.MeshStandardMaterial({
    name: 'heaven_window_glass',
    color: '#182430',
    roughness: 0.05,
    metalness: 0.15,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  }),

  // Interior Warm Glow Glass (Emissive for night/dusk realism)
  glassInteriorGlow: new THREE.MeshStandardMaterial({
    name: 'heaven_interior_glow',
    color: '#FFDFB0',
    emissive: new THREE.Color('#FFC870'),
    emissiveIntensity: 0.85,
    roughness: 0.2,
  }),

  // Asphalt Roadway & Driveway Paving
  asphalt: new THREE.MeshStandardMaterial({
    name: 'heaven_asphalt',
    color: '#26292E',
    roughness: 0.92,
    metalness: 0.02,
  }),

  // Concrete Sidewalk & Curbs
  sidewalkConcrete: new THREE.MeshStandardMaterial({
    name: 'heaven_sidewalk',
    color: '#8A8884',
    roughness: 0.78,
  }),

  // Biophilic Green Plant Foliage
  foliage: new THREE.MeshStandardMaterial({
    name: 'heaven_foliage',
    color: '#2C5024',
    roughness: 0.85,
  }),

  // Flowering Bougainvillea Accent
  flowerAccent: new THREE.MeshStandardMaterial({
    name: 'heaven_flower_accent',
    color: '#C43D68',
    roughness: 0.75,
  }),

  // Silver Car Metallic
  silverCar: new THREE.MeshStandardMaterial({
    name: 'heaven_car_silver',
    color: '#C5C9CE',
    roughness: 0.25,
    metalness: 0.90,
  }),
};

// Geometry helpers
function createBox(w, h, d, mat, name, pos = [0, 0, 0]) {
  const geom = new THREE.BoxGeometry(w, h, d);
  geom.computeVertexNormals();
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createCylinder(rt, rb, h, segs, mat, name, pos = [0, 0, 0]) {
  const geom = new THREE.CylinderGeometry(rt, rb, h, segs);
  geom.computeVertexNormals();
  const mesh = new THREE.Mesh(geom, mat);
  mesh.name = name;
  mesh.position.set(...pos);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

const root = new THREE.Group();
root.name = 'Heaven_Building_Root';

// ==========================================
// 3. GROUND FLOOR: STILT PARKING & ENTRANCE
// ==========================================
console.log('1/5 Building Ground Stilt, Entrance Gate, & Streetscape...');
const groundGroup = new THREE.Group();
groundGroup.name = 'Ground_Stilt_Infrastructure';

// Ground concrete base slab
groundGroup.add(createBox(TOWER_WIDTH + 8.0, 0.3, TOWER_DEPTH + 14.0, materials.sidewalkConcrete, 'Ground_Base_Slab', [0, 0.15, 3.0]));

// Structural stilt columns supporting upper tower (3x3 grid)
const colX = [-7.0, 0, 7.0];
const colZ = [-6.0, 0, 6.0];
colX.forEach((cx, xi) => {
  colZ.forEach((cz, zi) => {
    groundGroup.add(createBox(0.8, GROUND_HEIGHT, 0.8, materials.slateGray, `Stilt_Column_${xi}_${zi}`, [cx, GROUND_HEIGHT / 2, cz]));
  });
});

// Ground Stilt Ceiling (undercut with teak timber slats)
groundGroup.add(createBox(TOWER_WIDTH, 0.15, TOWER_DEPTH, materials.teakWood, 'Stilt_Ceiling_Teak', [0, GROUND_HEIGHT - 0.08, 0]));

// Enclosed Rear Security & Elevator Lobby Core
groundGroup.add(createBox(5.0, GROUND_HEIGHT, 6.0, materials.slateGray, 'Stilt_Lift_Core', [0, GROUND_HEIGHT / 2, -3.0]));
groundGroup.add(createBox(4.6, 2.8, 0.15, materials.glassWindow, 'Stilt_Lobby_Glass', [0, 1.4, 0.08]));

// Entrance Gatehouse / Reception Cabin ("Laura's" / Security Desk)
groundGroup.add(createBox(3.4, 2.8, 2.2, materials.whiteStucco, 'Security_Cabin_Body', [-1.2, 1.4, 8.8]));
groundGroup.add(createBox(2.2, 1.4, 0.1, materials.glassWindow, 'Security_Cabin_Window', [-1.2, 1.6, 9.95]));
groundGroup.add(createBox(3.6, 0.15, 2.4, materials.charcoalMetal, 'Security_Cabin_Roof', [-1.2, 2.88, 8.8]));

// White Entrance Portal Gate with "OUT" Sign
const portalGroup = new THREE.Group();
portalGroup.name = 'Entrance_Portal_Gate';
portalGroup.add(createBox(0.6, 3.4, 0.6, materials.whiteStucco, 'Portal_Pillar_Left', [2.4, 1.7, 9.8]));
portalGroup.add(createBox(0.6, 3.4, 0.6, materials.whiteStucco, 'Portal_Pillar_Right', [5.8, 1.7, 9.8]));
portalGroup.add(createBox(4.0, 0.7, 0.6, materials.whiteStucco, 'Portal_Header_Beam', [4.1, 3.45, 9.8]));
// "OUT" dark fascia text panel
portalGroup.add(createBox(1.2, 0.4, 0.08, materials.charcoalMetal, 'Portal_Sign_OUT', [5.0, 3.45, 10.15]));
// Black decorative gate
portalGroup.add(createBox(2.8, 2.2, 0.06, materials.charcoalMetal, 'Entrance_Iron_Gate', [4.1, 1.1, 9.8]));
groundGroup.add(portalGroup);

// Left Boundary Wall with gate
groundGroup.add(createBox(0.35, 2.4, 8.0, materials.slateGray, 'Boundary_Wall_West', [-TOWER_WIDTH / 2 - 2.5, 1.2, 4.0]));
groundGroup.add(createBox(4.5, 2.4, 0.35, materials.slateGray, 'Boundary_Wall_Front_Left', [-6.5, 1.2, 9.8]));

// Right Boundary Wall with brick/tile accent
groundGroup.add(createBox(0.35, 2.4, 8.0, materials.slateGray, 'Boundary_Wall_East', [TOWER_WIDTH / 2 + 2.5, 1.2, 4.0]));
groundGroup.add(createBox(3.0, 2.4, 0.35, materials.slateGray, 'Boundary_Wall_Front_Right', [7.8, 1.2, 9.8]));

// Planter beds with lush greenery along front boundary
const planterGroup = new THREE.Group();
planterGroup.name = 'Front_Planters';
planterGroup.add(createBox(4.0, 0.5, 0.8, materials.charcoalMetal, 'Planter_Box_L', [-6.5, 0.25, 10.3]));
planterGroup.add(createBox(3.8, 0.7, 0.6, materials.foliage, 'Hedge_L', [-6.5, 0.8, 10.3]));
planterGroup.add(createBox(2.8, 0.5, 0.8, materials.charcoalMetal, 'Planter_Box_R', [7.8, 0.25, 10.3]));
planterGroup.add(createBox(2.6, 0.7, 0.6, materials.foliage, 'Hedge_R', [7.8, 0.8, 10.3]));
// Pink flower clusters on hedges
planterGroup.add(createBox(1.2, 0.3, 0.4, materials.flowerAccent, 'Flowers_L', [-6.0, 1.1, 10.3]));
planterGroup.add(createBox(1.0, 0.3, 0.4, materials.flowerAccent, 'Flowers_R', [7.5, 1.1, 10.3]));
groundGroup.add(planterGroup);

// Asphalt Street Roadway in front of building
groundGroup.add(createBox(TOWER_WIDTH + 24.0, 0.08, 10.0, materials.asphalt, 'Street_Roadway', [0, 0.04, 15.8]));
// White dashed center line
for (let lx = -18; lx <= 18; lx += 4.5) {
  groundGroup.add(createBox(2.5, 0.01, 0.2, materials.whiteStucco, `Road_Dash_${lx}`, [lx, 0.09, 15.8]));
}
// Concrete curb
groundGroup.add(createBox(TOWER_WIDTH + 24.0, 0.18, 0.35, materials.sidewalkConcrete, 'Street_Curb', [0, 0.12, 10.8]));

// Silver Sedan Car (Replicating the car in the reference image)
const carGroup = new THREE.Group();
carGroup.name = 'Silver_Sedan_Car';
carGroup.position.set(4.8, 0.45, 14.5);
carGroup.rotation.y = -0.05;
// Car body lower
carGroup.add(createBox(4.2, 0.65, 1.8, materials.silverCar, 'Car_Chassis'));
// Car cabin & roof
carGroup.add(createBox(2.2, 0.55, 1.6, materials.silverCar, 'Car_Cabin', [-0.2, 0.55, 0]));
// Windshield & side windows
carGroup.add(createBox(2.1, 0.48, 1.55, materials.glassWindow, 'Car_Windows', [-0.2, 0.55, 0]));
// Wheels
[-1.3, 1.3].forEach((wx, wi) => {
  [-0.9, 0.9].forEach((wz, zi) => {
    carGroup.add(createCylinder(0.32, 0.32, 0.24, 16, materials.charcoalMetal, `Wheel_${wi}_${zi}`, [wx, -0.15, wz]));
  });
});
groundGroup.add(carGroup);

root.add(groundGroup);

// ==========================================
// 4. RESIDENTIAL FLOORS 1 THROUGH 9 (G+9)
// ==========================================
console.log('2/5 Building 9 Typical Residential Floors...');

for (let f = 1; f <= RESIDENTIAL_FLOORS; f++) {
  const floorElevation = GROUND_HEIGHT + (f - 1) * FLOOR_HEIGHT;
  const floorGroup = new THREE.Group();
  floorGroup.name = `Level_0${f}`;
  floorGroup.position.set(0, floorElevation, 0);

  // 1. Structural Floor Slab (Full perimeter + balcony overhangs)
  floorGroup.add(createBox(TOWER_WIDTH, SLAB_THICKNESS, TOWER_DEPTH, materials.whiteStucco, `L0${f}_Floor_Slab`, [0, SLAB_THICKNESS / 2, 0]));

  // 2. Central White Tower Pier (X: -2.7 to +2.7, Z: 6.8 to 8.2)
  const pierHeight = FLOOR_HEIGHT - SLAB_THICKNESS;
  const pierCenterY = SLAB_THICKNESS + pierHeight / 2;
  const pierZ = TOWER_DEPTH / 2 + 0.1;

  // Solid white central face with window punch openings
  floorGroup.add(createBox(CENTRAL_PIER_WIDTH, pierHeight, 0.35, materials.whiteStucco, `L0${f}_Central_Pier_Wall`, [0, pierCenterY, pierZ]));

  // Dual Punch Windows in Central Pier (Left & Right)
  const windowW = 1.35;
  const windowH = 1.85;
  const windowY = pierCenterY - 0.05;
  [-1.4, 1.4].forEach((wx, wi) => {
    // Window reveal & frame
    floorGroup.add(createBox(windowW + 0.1, windowH + 0.1, 0.15, materials.charcoalMetal, `L0${f}_WindowFrame_${wi}`, [wx, windowY, pierZ + 0.12]));
    // Window glass
    floorGroup.add(createBox(windowW, windowH, 0.06, materials.glassWindow, `L0${f}_WindowGlass_${wi}`, [wx, windowY, pierZ + 0.12]));
    // Internal light glow
    floorGroup.add(createBox(windowW * 0.9, windowH * 0.9, 0.02, materials.glassInteriorGlow, `L0${f}_WindowGlow_${wi}`, [wx, windowY, pierZ + 0.08]));
    // Mullion cross
    floorGroup.add(createBox(0.04, windowH, 0.08, materials.charcoalMetal, `L0${f}_WindowMullionV_${wi}`, [wx, windowY, pierZ + 0.14]));
    floorGroup.add(createBox(windowW, 0.04, 0.08, materials.charcoalMetal, `L0${f}_WindowMullionH_${wi}`, [wx, windowY, pierZ + 0.14]));
  });

  // Winged Logo & "HEAVEN" Typography on Top Floor (Floor 9)
  if (f === RESIDENTIAL_FLOORS) {
    const logoY = pierCenterY + 0.85;
    // Wing icon
    floorGroup.add(createBox(0.9, 0.18, 0.08, materials.charcoalMetal, 'Logo_Wings_Left', [-0.6, logoY, pierZ + 0.2]));
    floorGroup.add(createBox(0.9, 0.18, 0.08, materials.charcoalMetal, 'Logo_Wings_Right', [0.6, logoY, pierZ + 0.2]));
    floorGroup.add(createCylinder(0.15, 0.15, 0.08, 12, materials.charcoalMetal, 'Logo_Shield_Center', [0, logoY, pierZ + 0.2]));
    // "HEAVEN" plaque
    floorGroup.add(createBox(1.8, 0.32, 0.06, materials.charcoalMetal, 'HEAVEN_Sign_Plate', [0, logoY - 0.28, pierZ + 0.2]));
  }

  // 3. Continuous Vertical Teak Wood Louver Strips flanking Central Pier
  [-1, 1].forEach((side) => {
    const louverCenterX = side * (CENTRAL_PIER_WIDTH / 2 + LOUVER_WIDTH / 2);
    // Background wall behind louvers (dark charcoal)
    floorGroup.add(createBox(LOUVER_WIDTH, pierHeight, 0.25, materials.charcoalMetal, `L0${f}_Louver_BackWall_${side}`, [louverCenterX, pierCenterY, pierZ - 0.05]));

    // 5 Slender Vertical Teak Louver Slats
    for (let s = -2; s <= 2; s++) {
      const slatX = louverCenterX + s * 0.12;
      floorGroup.add(createBox(0.05, pierHeight, 0.22, materials.teakWood, `L0${f}_TeakSlat_${side}_${s}`, [slatX, pierCenterY, pierZ + 0.1]));
    }
  });

  // 4. Left Balcony Stack (X: -9.0 to -3.4, Z: 8.0 to 10.4)
  const leftBalcW = TOWER_WIDTH / 2 - CENTRAL_PIER_WIDTH / 2 - LOUVER_WIDTH; // ~5.6m
  const leftBalcCenterX = -TOWER_WIDTH / 2 + leftBalcW / 2;
  const balcZ = TOWER_DEPTH / 2 + BALCONY_PROJECTION / 2;

  // Cantilevered Balcony Slab with crisp white fascia
  floorGroup.add(createBox(leftBalcW, SLAB_THICKNESS, BALCONY_PROJECTION, materials.whiteStucco, `L0${f}_Left_Balcony_Slab`, [leftBalcCenterX, SLAB_THICKNESS / 2, balcZ]));
  // Dark charcoal fascia drip edge
  floorGroup.add(createBox(leftBalcW + 0.04, 0.06, BALCONY_PROJECTION + 0.04, materials.charcoalMetal, `L0${f}_Left_Balcony_Fascia`, [leftBalcCenterX, 0.02, balcZ]));

  // Left Balcony Glass Railing & Black Frame (Height 1.1m)
  const railH = 1.05;
  const railY = SLAB_THICKNESS + railH / 2;
  const frontRailZ = TOWER_DEPTH / 2 + BALCONY_PROJECTION - 0.04;
  // Front glass
  floorGroup.add(createBox(leftBalcW - 0.1, railH, 0.04, materials.glassClear, `L0${f}_Left_Rail_Glass`, [leftBalcCenterX, railY, frontRailZ]));
  // Top handrail
  floorGroup.add(createBox(leftBalcW, 0.05, 0.06, materials.charcoalMetal, `L0${f}_Left_Handrail`, [leftBalcCenterX, SLAB_THICKNESS + railH, frontRailZ]));
  // Left side glass return
  floorGroup.add(createBox(0.04, railH, BALCONY_PROJECTION, materials.glassClear, `L0${f}_Left_Rail_Return`, [-TOWER_WIDTH / 2 + 0.04, railY, balcZ]));
  floorGroup.add(createBox(0.06, 0.05, BALCONY_PROJECTION, materials.charcoalMetal, `L0${f}_Left_Handrail_Return`, [-TOWER_WIDTH / 2 + 0.04, SLAB_THICKNESS + railH, balcZ]));

  // Corner Planter with green bush on Left Balcony
  floorGroup.add(createBox(0.65, 0.45, 0.65, materials.whiteStucco, `L0${f}_Left_Planter_Box`, [leftBalcCenterX - leftBalcW / 2 + 0.45, SLAB_THICKNESS + 0.22, frontRailZ - 0.45]));
  floorGroup.add(createBox(0.55, 0.4, 0.55, materials.foliage, `L0${f}_Left_Planter_Green`, [leftBalcCenterX - leftBalcW / 2 + 0.45, SLAB_THICKNESS + 0.55, frontRailZ - 0.45]));

  // Recessed Sliding Glass Doors behind Left Balcony
  floorGroup.add(createBox(leftBalcW * 0.85, pierHeight - 0.2, 0.1, materials.glassWindow, `L0${f}_Left_Sliding_Door`, [leftBalcCenterX, pierCenterY, TOWER_DEPTH / 2 + 0.05]));
  floorGroup.add(createBox(leftBalcW * 0.85, 0.06, 0.12, materials.charcoalMetal, `L0${f}_Left_Door_Frame_Top`, [leftBalcCenterX, pierCenterY + pierHeight / 2 - 0.1, TOWER_DEPTH / 2 + 0.08]));

  // 5. Right Balcony Stack (X: +3.4 to +9.0)
  const rightBalcW = leftBalcW;
  const rightBalcCenterX = TOWER_WIDTH / 2 - rightBalcW / 2;

  // Cantilevered Balcony Slab
  floorGroup.add(createBox(rightBalcW, SLAB_THICKNESS, BALCONY_PROJECTION, materials.whiteStucco, `L0${f}_Right_Balcony_Slab`, [rightBalcCenterX, SLAB_THICKNESS / 2, balcZ]));
  floorGroup.add(createBox(rightBalcW + 0.04, 0.06, BALCONY_PROJECTION + 0.04, materials.charcoalMetal, `L0${f}_Right_Balcony_Fascia`, [rightBalcCenterX, 0.02, balcZ]));

  // Right Balcony Glass Railing
  floorGroup.add(createBox(rightBalcW - 0.1, railH, 0.04, materials.glassClear, `L0${f}_Right_Rail_Glass`, [rightBalcCenterX, railY, frontRailZ]));
  floorGroup.add(createBox(rightBalcW, 0.05, 0.06, materials.charcoalMetal, `L0${f}_Right_Handrail`, [rightBalcCenterX, SLAB_THICKNESS + railH, frontRailZ]));
  // Right side glass return
  floorGroup.add(createBox(0.04, railH, BALCONY_PROJECTION, materials.glassClear, `L0${f}_Right_Rail_Return`, [TOWER_WIDTH / 2 - 0.04, railY, balcZ]));
  floorGroup.add(createBox(0.06, 0.05, BALCONY_PROJECTION, materials.charcoalMetal, `L0${f}_Right_Handrail_Return`, [TOWER_WIDTH / 2 - 0.04, SLAB_THICKNESS + railH, balcZ]));

  // Corner Planter on Right Balcony
  floorGroup.add(createBox(0.65, 0.45, 0.65, materials.whiteStucco, `L0${f}_Right_Planter_Box`, [rightBalcCenterX + rightBalcW / 2 - 0.45, SLAB_THICKNESS + 0.22, frontRailZ - 0.45]));
  floorGroup.add(createBox(0.55, 0.4, 0.55, materials.foliage, `L0${f}_Right_Planter_Green`, [rightBalcCenterX + rightBalcW / 2 - 0.45, SLAB_THICKNESS + 0.55, frontRailZ - 0.45]));

  // Recessed Sliding Glass Doors behind Right Balcony
  floorGroup.add(createBox(rightBalcW * 0.85, pierHeight - 0.2, 0.1, materials.glassWindow, `L0${f}_Right_Sliding_Door`, [rightBalcCenterX, pierCenterY, TOWER_DEPTH / 2 + 0.05]));

  // 6. Solid Dark Slate-Gray Side Shear Walls (East and West)
  // West Wall (-X face)
  floorGroup.add(createBox(0.4, pierHeight, TOWER_DEPTH, materials.slateGray, `L0${f}_West_Wall`, [-TOWER_WIDTH / 2, pierCenterY, 0]));
  // East Wall (+X face)
  floorGroup.add(createBox(0.4, pierHeight, TOWER_DEPTH, materials.slateGray, `L0${f}_East_Wall`, [TOWER_WIDTH / 2, pierCenterY, 0]));

  // East Side Recessed Window Bays with White Horizontal Trim (Visible in reference image)
  [-3.0, 3.0].forEach((wz, wi) => {
    // Window reveal opening
    floorGroup.add(createBox(0.45, 1.8, 2.2, materials.charcoalMetal, `L0${f}_East_Window_Frame_${wi}`, [TOWER_WIDTH / 2 + 0.02, pierCenterY, wz]));
    floorGroup.add(createBox(0.05, 1.7, 2.1, materials.glassWindow, `L0${f}_East_Window_Glass_${wi}`, [TOWER_WIDTH / 2 + 0.05, pierCenterY, wz]));
    // Horizontal white slab edge band
    floorGroup.add(createBox(0.12, 0.35, 2.8, materials.whiteStucco, `L0${f}_East_Trim_${wi}`, [TOWER_WIDTH / 2 + 0.1, SLAB_THICKNESS / 2, wz]));
  });

  // 7. Rear Structural Wall (-Z face)
  floorGroup.add(createBox(TOWER_WIDTH, pierHeight, 0.4, materials.slateGray, `L0${f}_Rear_Wall`, [0, pierCenterY, -TOWER_DEPTH / 2]));
  // Rear bedroom windows
  [-4.5, 4.5].forEach((rx, ri) => {
    floorGroup.add(createBox(2.2, 1.8, 0.08, materials.glassWindow, `L0${f}_Rear_Window_${ri}`, [rx, pierCenterY, -TOWER_DEPTH / 2 - 0.05]));
  });

  root.add(floorGroup);
}

// ==========================================
// 5. ROOFTOP CROWN & PERGOLA WITH CUTOUTS
// ==========================================
console.log('3/5 Building Rooftop Crown & Pergola with Circular Cutouts...');
const crownGroup = new THREE.Group();
crownGroup.name = 'Rooftop_Crown_Pergola';
crownGroup.position.set(0, ROOF_ELEVATION, 0);

// Roof slab
crownGroup.add(createBox(TOWER_WIDTH + 0.4, 0.3, TOWER_DEPTH + 0.4, materials.whiteStucco, 'Roof_Slab', [0, 0.15, 0]));

// Perimeter Parapet Wall (1.1m height with charcoal coping)
crownGroup.add(createBox(TOWER_WIDTH + 0.2, 1.1, 0.35, materials.slateGray, 'Parapet_Front', [0, 0.85, TOWER_DEPTH / 2]));
crownGroup.add(createBox(TOWER_WIDTH + 0.2, 1.1, 0.35, materials.slateGray, 'Parapet_Rear', [0, 0.85, -TOWER_DEPTH / 2]));
crownGroup.add(createBox(0.35, 1.1, TOWER_DEPTH, materials.slateGray, 'Parapet_West', [-TOWER_WIDTH / 2, 0.85, 0]));
crownGroup.add(createBox(0.35, 1.1, TOWER_DEPTH, materials.slateGray, 'Parapet_East', [TOWER_WIDTH / 2, 0.85, 0]));
// Dark charcoal coping caps
crownGroup.add(createBox(TOWER_WIDTH + 0.3, 0.08, 0.42, materials.charcoalMetal, 'Parapet_Coping_Front', [0, 1.44, TOWER_DEPTH / 2]));
crownGroup.add(createBox(TOWER_WIDTH + 0.3, 0.08, 0.42, materials.charcoalMetal, 'Parapet_Coping_Rear', [0, 1.44, -TOWER_DEPTH / 2]));

// Lift Machine Room (LMR) core
crownGroup.add(createBox(5.2, 3.2, 6.0, materials.slateGray, 'LMR_Structure', [0, 1.6, -1.5]));

// Central Charcoal Portal Frame with 4 Circular Perforations (Exact Match to Image 1)
const portalHeight = 3.6;
const crownPortalGroup = new THREE.Group();
crownPortalGroup.name = 'Crown_Feature_Portal';

// Front portal frame box directly above central pier
crownPortalGroup.add(createBox(0.5, portalHeight, 2.4, materials.charcoalMetal, 'Crown_Pillar_L', [-CENTRAL_PIER_WIDTH / 2, portalHeight / 2, TOWER_DEPTH / 2 - 0.4]));
crownPortalGroup.add(createBox(0.5, portalHeight, 2.4, materials.charcoalMetal, 'Crown_Pillar_R', [CENTRAL_PIER_WIDTH / 2, portalHeight / 2, TOWER_DEPTH / 2 - 0.4]));
crownPortalGroup.add(createBox(CENTRAL_PIER_WIDTH + 0.5, 0.45, 2.4, materials.charcoalMetal, 'Crown_Lintel_Top', [0, portalHeight - 0.22, TOWER_DEPTH / 2 - 0.4]));

// 4 Circular Cutout Skylight Rings on Top Slab (Replicating circular holes in reference)
[-1.8, -0.6, 0.6, 1.8].forEach((holeX, hi) => {
  crownPortalGroup.add(createCylinder(0.42, 0.42, 0.12, 24, materials.whiteStucco, `Skylight_Ring_${hi}`, [holeX, portalHeight + 0.02, TOWER_DEPTH / 2 - 0.4]));
  crownPortalGroup.add(createCylinder(0.34, 0.34, 0.14, 24, materials.charcoalMetal, `Skylight_Inner_${hi}`, [holeX, portalHeight + 0.02, TOWER_DEPTH / 2 - 0.4]));
});

// Cantilevered Pergola Trellis Beams extending Left and Right
// Left Trellis (extending over left terrace)
for (let pz = -2.0; pz <= 2.0; pz += 0.8) {
  crownPortalGroup.add(createBox(4.5, 0.15, 0.12, materials.charcoalMetal, `Trellis_Beam_L_${pz.toFixed(1)}`, [-CENTRAL_PIER_WIDTH / 2 - 2.2, portalHeight - 0.1, TOWER_DEPTH / 2 - 0.4 + pz]));
}
// Right Trellis (extending over right terrace)
for (let pz = -2.0; pz <= 2.0; pz += 0.8) {
  crownPortalGroup.add(createBox(4.5, 0.15, 0.12, materials.charcoalMetal, `Trellis_Beam_R_${pz.toFixed(1)}`, [CENTRAL_PIER_WIDTH / 2 + 2.2, portalHeight - 0.1, TOWER_DEPTH / 2 - 0.4 + pz]));
}

crownGroup.add(crownPortalGroup);
root.add(crownGroup);

// ==========================================
// 6. EXPORT TO GLB & OPTIMIZE WITH GLTF-TRANSFORM
// ==========================================
async function exportAndOptimize() {
  console.log('4/5 Exporting to Raw Binary GLB...');
  const exporter = new GLTFExporter();
  const rawGlb = await exporter.parseAsync(root, { binary: true });
  console.log(`Raw GLB Size: ${(rawGlb.byteLength / (1024 * 1024)).toFixed(2)} MB`);

  console.log('5/5 Running @gltf-transform Hygiene Pipeline (Weld, Dedup, Resample, Prune)...');
  const io = new NodeIO();
  const doc = await io.readBinary(new Uint8Array(rawGlb));

  await doc.transform(
    weld({ tolerance: 0.0001 }),
    dedup(),
    resample(),
    prune({ keepAttributes: true })
  );

  const finalGlbBuffer = await io.writeBinary(doc);
  const finalSizeMb = (finalGlbBuffer.byteLength / (1024 * 1024)).toFixed(2);
  console.log(`Optimized GLB Size: ${finalSizeMb} MB`);

  // Write to public/models/Aarohan_Tower_G14.glb and public/models/Heaven_Tower.glb
  const outPath1 = path.resolve('public/models/Heaven_Tower.glb');
  fs.writeFileSync(outPath1, Buffer.from(finalGlbBuffer));
  console.log(`Saved Heaven Tower GLB: ${outPath1}`);

  const outPath2 = path.resolve('public/models/Aarohan_Tower_G14.glb');
  fs.writeFileSync(outPath2, Buffer.from(finalGlbBuffer));
  console.log(`Updated active Aarohan_Tower_G14 GLB: ${outPath2}`);

  console.log('--- GLB Generation Complete! ---');
}

exportAndOptimize().catch((err) => {
  console.error('Fatal GLB generator error:', err);
  process.exit(1);
});
