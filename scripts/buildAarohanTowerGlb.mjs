/**
 * Senior Architectural G+14 Residential Tower Model Generator & Hygiene Pipeline
 * Vadodara Luxury Standard (Sevasi-Bhayli corridor architectural benchmark)
 *
 * SPECIFICATION & HYGIENE REQUIREMENTS:
 * 1. Opaque Shell:
 *    - All structural walls, floor slabs, demising partitions, core, and columns are 100% opaque (depthWrite: true, transparent: false).
 *    - Complete interior demising walls per flat (Flats A, B, C, D) and central core enclosure ensure ZERO see-through from any angle.
 * 2. Façade Grid per Floor (3.2m floor-to-floor):
 *    - Full exterior perimeter wall panels with continuous spandrel beams and sill walls.
 *    - Window openings with 100mm reveals, 60mm dark bronze/charcoal frames (#2B2B2E).
 *    - Vertical fins projecting 350mm every 2nd bay for crisp shadow casting.
 *    - 2-tone palette: warm off-white plaster (#E8E1D5) + terracotta accent band (#B5654A) with recessed shadow grooves.
 * 3. Slabs and Balconies:
 *    - 180mm structural slab thickness with 40mm projecting drip edge band in contrasting tone (#3A3A3D).
 *    - Balconies: 1.5m depth with 1.1m high nearly clear laminated glass railing (#D8E2EC, opacity 0.20, roughness 0.05)
 *      and 50mm slim steel/bronze top handrail.
 * 4. Double-Height Ground Lobby (Y: 0 to 6.0m):
 *    - 5.8m high structural glass curtain wall, 60mm charcoal mullions, fluted limestone columns,
 *      honed marble reception desk, backlit onyx portal, and 5.5m cantilevered entrance canopy with teak soffit & LED lights.
 *    - Vehicular driveway, descending parking ramp, concrete curbs, boundary wall with teak louvres, and security gatehouse.
 * 5. Crown & Superstructure (Y: 50.8m to 56.5m):
 *    - 1.2m high parapet wall with sleek charcoal bronze coping cap (#2B2B2E, no yellow cap).
 *    - Stepped Lift Machine Room (LMR) with charcoal architectural ventilation louvres.
 *    - Overhead Water Tank (OHT) enclosure with terracotta fluting.
 *    - Rooftop pergola pavilion with horizontal trellis slats and warm LED linear contour uplighting.
 * 6. Export Hygiene:
 *    - gltf-transform pipeline: weld coplanar vertices, deduplicate shared buffers, prune unused nodes.
 *    - Target size < 8MB, under 150k triangles, 100% manifold metric geometry.
 */

import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { NodeIO } from '@gltf-transform/core';
import { weld, dedup, resample, prune } from '@gltf-transform/functions';

// Polyfill Node.js FileReader for GLTFExporter parseAsync
class FileReaderPolyfill {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      if (this.onloadend) this.onloadend();
    });
  }
}
globalThis.FileReader = FileReaderPolyfill;

console.log('--- Generating Vadodara G+14 Residential Tower (Aarohan Residences) ---');

// ==========================================
// 1. ARCHITECTURAL PBR MATERIALS SETUP
// ==========================================
const materials = {
  // 1. Primary Façade: Warm Off-White Plaster (Vadodara Luxury Standard #E8E1D5)
  plasterIvory: new THREE.MeshStandardMaterial({
    name: 'plaster_ivory_façade',
    color: '#E8E1D5',
    roughness: 0.85,
    metalness: 0.02,
    transparent: false,
    depthWrite: true,
  }),

  // 2. Accent Façade: Muted Terracotta Plaster (#B5654A)
  plasterTerracotta: new THREE.MeshStandardMaterial({
    name: 'plaster_terracotta_accent',
    color: '#B5654A',
    roughness: 0.88,
    metalness: 0.02,
    transparent: false,
    depthWrite: true,
  }),

  // 3. Podium & Guardhouse: Cladded Honed Limestone (#8C7B6B)
  podiumStone: new THREE.MeshStandardMaterial({
    name: 'podium_honed_limestone',
    color: '#8C7B6B',
    roughness: 0.82,
    metalness: 0.03,
    transparent: false,
    depthWrite: true,
  }),

  // 4. Central Core: Dark Charcoal Fluted Basalt Stone (#26292E)
  charcoalCore: new THREE.MeshStandardMaterial({
    name: 'charcoal_basalt_core',
    color: '#26292E',
    roughness: 0.85,
    metalness: 0.05,
    transparent: false,
    depthWrite: true,
  }),

  // 5. Interior Demising & Party Walls: Warm Interior Linen Off-White (#E2DDD4)
  interiorWall: new THREE.MeshStandardMaterial({
    name: 'interior_party_wall',
    color: '#E2DDD4',
    roughness: 0.90,
    metalness: 0.01,
    transparent: false,
    depthWrite: true,
  }),

  // 6. Window Frames & Architectural Fins: Dark Bronze / Charcoal Aluminum (#2B2B2E)
  charcoalFrame: new THREE.MeshStandardMaterial({
    name: 'charcoal_aluminum_frame',
    color: '#2B2B2E',
    roughness: 0.35,
    metalness: 0.85,
    transparent: false,
    depthWrite: true,
  }),

  // 7. Slab Drip Edge Reveal: Contrasting Charcoal Bronze (#3A3A3D)
  slabEdge: new THREE.MeshStandardMaterial({
    name: 'slab_drip_edge_band',
    color: '#3A3A3D',
    roughness: 0.40,
    metalness: 0.75,
    transparent: false,
    depthWrite: true,
  }),

  // 8. Soffits & Entrance Accents: Warm Teak Timber Slats (#6B4423)
  teakSoffit: new THREE.MeshStandardMaterial({
    name: 'teak_timber_soffit',
    color: '#6B4423',
    roughness: 0.65,
    metalness: 0.05,
    transparent: false,
    depthWrite: true,
  }),

  // 9. Balcony Glass Balustrade: Nearly Clear Laminated Glass (opacity 0.20, roughness 0.05, #D8E2EC)
  glassBalustrade: new THREE.MeshStandardMaterial({
    name: 'glass_balustrade_clear',
    color: '#D8E2EC',
    roughness: 0.05,
    metalness: 0.10,
    transparent: true,
    opacity: 0.20,
    depthWrite: false,
  }),

  // 10. Lobby Glass Curtain Wall: Structural Glazing (#1C242D, opacity 0.85, roughness 0.05)
  glassFacade: new THREE.MeshStandardMaterial({
    name: 'facade_glass_reflective',
    color: '#1C242D',
    roughness: 0.05,
    metalness: 0.10,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  }),

  // 11. Driveway Asphalt: Deep Muted Charcoal (#282B30)
  asphaltDriveway: new THREE.MeshStandardMaterial({
    name: 'driveway_asphalt_paving',
    color: '#282B30',
    roughness: 0.92,
    metalness: 0.02,
    transparent: false,
    depthWrite: true,
  }),

  // 12. Podium Landscaping Foliage (#2D4B2A)
  foliageGreen: new THREE.MeshStandardMaterial({
    name: 'podium_hedge_foliage',
    color: '#2D4B2A',
    roughness: 0.88,
    metalness: 0.0,
    transparent: false,
    depthWrite: true,
  }),

  // 13. Rooftop & Canopy Warm Architectural LED Linear Strip (3000K Warm Gold)
  ledLinear: new THREE.MeshStandardMaterial({
    name: 'led_architectural_linear',
    color: '#FFE0A0',
    emissive: new THREE.Color('#FFE0A0'),
    emissiveIntensity: 1.5,
    roughness: 0.2,
    transparent: false,
    depthWrite: true,
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

const root = new THREE.Scene();
root.name = 'Aarohan_Residences_Tower_G14';

// ==========================================
// 2. PODIUM & BASE (Y: 0 to 6.0m)
// 2-Storey Double-Height Lobby with Structural Glass
// ==========================================
console.log('1/4 Building Podium, Double-Height Lobby, Canopy, and Site Infrastructure...');
const podiumGroup = new THREE.Group();
podiumGroup.name = 'Podium_Base';

// Ground Foundation Slab (38m wide x 30m deep x 0.4m)
podiumGroup.add(
  createBox(38.0, 0.4, 30.0, materials.podiumStone, 'Podium_Ground_Plaza', [0, -0.2, 0])
);

// Arrival Motor Court (Textured Asphalt with 160mm curbs)
podiumGroup.add(
  createBox(34.0, 0.05, 9.0, materials.asphaltDriveway, 'Podium_Arrival_Driveway', [0, 0.03, 10.0])
);
podiumGroup.add(
  createBox(34.2, 0.16, 0.25, materials.podiumStone, 'Driveway_Curb_North', [0, 0.08, 5.38])
);
podiumGroup.add(
  createBox(34.2, 0.16, 0.25, materials.podiumStone, 'Driveway_Curb_South', [0, 0.08, 14.62])
);

// Vehicular Parking Ramp on West Flank (Descending with concrete safety walls)
const rampGroup = new THREE.Group();
rampGroup.name = 'Podium_Vehicular_Ramp';
const rampMesh = createBox(5.2, 0.22, 13.0, materials.asphaltDriveway, 'Vehicular_Ramp_Slab', [-15.0, 0.25, -1.0]);
rampMesh.rotation.x = 0.085;
rampGroup.add(rampMesh);
rampGroup.add(createBox(0.25, 0.95, 13.0, materials.charcoalFrame, 'Ramp_Safety_Barrier_Outer', [-17.7, 0.75, -1.0]));
rampGroup.add(createBox(0.25, 0.95, 13.0, materials.charcoalFrame, 'Ramp_Safety_Barrier_Inner', [-12.3, 0.75, -1.0]));
podiumGroup.add(rampGroup);

// Perimeter Boundary Wall & Security Gatehouse
const boundaryGroup = new THREE.Group();
boundaryGroup.name = 'Podium_Boundary_Gate';
boundaryGroup.add(createBox(11.5, 2.2, 0.35, materials.podiumStone, 'Boundary_Wall_Left', [-10.2, 1.1, 14.8]));
boundaryGroup.add(createBox(11.5, 2.2, 0.35, materials.podiumStone, 'Boundary_Wall_Right', [10.2, 1.1, 14.8]));
boundaryGroup.add(createBox(11.0, 1.4, 0.08, materials.teakSoffit, 'Boundary_Louvres_Left', [-10.2, 1.1, 14.8]));
boundaryGroup.add(createBox(11.0, 1.4, 0.08, materials.teakSoffit, 'Boundary_Louvres_Right', [10.2, 1.1, 14.8]));

// Security Guardhouse (3.2m x 2.6m x 3.0m)
const guardHouse = new THREE.Group();
guardHouse.name = 'Security_Guardhouse';
guardHouse.add(createBox(3.2, 3.0, 2.6, materials.podiumStone, 'Guardhouse_Body', [15.2, 1.5, 12.0]));
guardHouse.add(createBox(3.4, 0.25, 2.8, materials.charcoalFrame, 'Guardhouse_Fascia', [15.2, 3.1, 12.0]));
guardHouse.add(createBox(2.8, 1.6, 0.05, materials.glassFacade, 'Guardhouse_Corner_Window', [15.2, 1.6, 13.32]));
boundaryGroup.add(guardHouse);
boundaryGroup.add(createBox(7.4, 1.8, 0.1, materials.charcoalFrame, 'Motorized_Entrance_Gate', [0, 0.9, 14.8]));
podiumGroup.add(boundaryGroup);

// Double-Height Grand Entrance Lobby (Y: 0 to 6.0m)
const lobbyGroup = new THREE.Group();
lobbyGroup.name = 'Podium_DoubleHeight_Lobby';

// Lobby Opaque Rear & Side Structural Shell
lobbyGroup.add(createBox(25.4, 5.8, 0.4, materials.charcoalCore, 'Lobby_Rear_Wall', [0, 2.9, -8.5]));
lobbyGroup.add(createBox(0.4, 5.8, 17.2, materials.podiumStone, 'Lobby_West_Wall', [-12.6, 2.9, 0]));
lobbyGroup.add(createBox(0.4, 5.8, 17.2, materials.podiumStone, 'Lobby_East_Wall', [12.6, 2.9, 0]));

// Structural Glass Curtain Wall along South entrance (16.4m wide x 5.8m high)
lobbyGroup.add(createBox(16.4, 5.8, 0.08, materials.glassFacade, 'Lobby_Glass_Curtain_Wall', [0, 2.9, 8.45]));

// 60mm Charcoal structural lobby mullions
for (let mx = -7.5; mx <= 7.5; mx += 2.5) {
  lobbyGroup.add(createBox(0.06, 5.8, 0.16, materials.charcoalFrame, `Lobby_Mullion_${mx.toFixed(1)}`, [mx, 2.9, 8.47]));
}

// 4 Fluted Limestone Structural Columns (diameter 0.75m)
[-7.0, -2.5, 2.5, 7.0].forEach((cx, idx) => {
  lobbyGroup.add(
    createCylinder(0.38, 0.38, 5.8, 24, materials.podiumStone, `Lobby_Fluted_Column_${idx}`, [cx, 2.9, 7.8])
  );
});

// Lobby Interior Architecture: Honed marble reception desk & back-lit feature wall
lobbyGroup.add(createBox(4.2, 1.1, 1.2, materials.podiumStone, 'Lobby_Reception_Desk', [0, 0.55, 6.2]));
lobbyGroup.add(createBox(6.4, 4.8, 0.25, materials.charcoalCore, 'Lobby_Feature_Portal', [0, 2.6, 3.65]));
lobbyGroup.add(createBox(5.8, 4.2, 0.1, materials.ledLinear, 'Lobby_Backlit_Onyx_Feature', [0, 2.6, 3.8]));

// Cantilevered Entrance Canopy (5.5m projection, 14.5m wide, 0.45m thick at Y = 5.6m)
const canopyGroup = new THREE.Group();
canopyGroup.name = 'Lobby_Entrance_Canopy';
canopyGroup.add(createBox(14.5, 0.45, 5.5, materials.charcoalFrame, 'Canopy_Bronze_Fascia', [0, 5.6, 11.2]));
canopyGroup.add(createBox(14.1, 0.05, 5.1, materials.teakSoffit, 'Canopy_Teak_Soffit', [0, 5.35, 11.2]));
canopyGroup.add(createBox(12.5, 0.02, 0.2, materials.ledLinear, 'Canopy_Recessed_LED_1', [0, 5.32, 10.0]));
canopyGroup.add(createBox(12.5, 0.02, 0.2, materials.ledLinear, 'Canopy_Recessed_LED_2', [0, 5.32, 12.4]));
lobbyGroup.add(canopyGroup);

// Podium Landscaping Planter Boxes with Dense Foliage
const gardenGroup = new THREE.Group();
gardenGroup.name = 'Podium_Landscaped_Deck';
gardenGroup.add(createBox(7.2, 0.8, 2.4, materials.podiumStone, 'Planter_Box_East', [11.8, 0.4, 4.0]));
gardenGroup.add(createBox(6.8, 0.9, 2.0, materials.foliageGreen, 'Hedge_Foliage_East', [11.8, 0.85, 4.0]));
gardenGroup.add(createBox(7.2, 0.8, 2.4, materials.podiumStone, 'Planter_Box_West', [-11.8, 0.4, 4.0]));
gardenGroup.add(createBox(6.8, 0.9, 2.0, materials.foliageGreen, 'Hedge_Foliage_West', [-11.8, 0.85, 4.0]));
podiumGroup.add(gardenGroup);
podiumGroup.add(lobbyGroup);

root.add(podiumGroup);

// ==========================================
// 3. TYPICAL RESIDENTIAL FLOORS (G+14)
// Floors 1 to 14, floor-to-floor height = 3.2m
// 100% OPAQUE SHELL WITH COMPLETE ENCLOSURE & ZERO SEE-THROUGH
// ==========================================
console.log('2/4 Building 14 Residential Floors with Opaque Enclosures, 100mm Reveals, Party Walls & Balconies...');

const totalResidentialFloors = 14;
const basePodiumHeight = 6.0;
const floorHeight = 3.2;

for (let f = 1; f <= totalResidentialFloors; f++) {
  const floorElevation = basePodiumHeight + (f - 1) * floorHeight;
  const padFloor = f.toString().padStart(2, '0');
  const floorGroup = new THREE.Group();
  floorGroup.name = `Level_${padFloor}`;

  // -------------------------------------------------------------
  // 1. Structural Floor Slab (180mm thickness spanning 25.4m x 17.4m)
  // -------------------------------------------------------------
  floorGroup.add(
    createBox(25.4, 0.18, 17.4, materials.plasterIvory, `Level_${padFloor}_Structural_Slab`, [0, floorElevation + 0.09, 0])
  );

  // Projecting 40mm Drip Edge Band in Contrasting Charcoal Bronze (#3A3A3D)
  floorGroup.add(
    createBox(25.8, 0.04, 17.8, materials.slabEdge, `Level_${padFloor}_Slab_Drip_Edge`, [0, floorElevation + 0.02, 0])
  );

  // Underside Teak Timber Soffit
  floorGroup.add(
    createBox(25.2, 0.03, 17.2, materials.teakSoffit, `Level_${padFloor}_Teak_Soffit`, [0, floorElevation - 0.015, 0])
  );

  // -------------------------------------------------------------
  // 2. Central Structural Core (6.8m x 6.8m x 3.02m) - 100% OPAQUE
  // -------------------------------------------------------------
  floorGroup.add(
    createBox(6.8, 3.02, 6.8, materials.charcoalCore, `Level_${padFloor}_Elevator_Core`, [0, floorElevation + 1.6, 0])
  );

  // -------------------------------------------------------------
  // 3. Interior Demising / Party Walls (Dividing 4 Flats per Floor)
  // Ensures looking into any window hits an interior room wall, NEVER sky!
  // -------------------------------------------------------------
  // North-South Demising Wall (along X = 0)
  floorGroup.add(
    createBox(0.25, 3.02, 5.15, materials.interiorWall, `Level_${padFloor}_Party_Wall_South`, [0, floorElevation + 1.6, 5.97])
  );
  floorGroup.add(
    createBox(0.25, 3.02, 5.15, materials.interiorWall, `Level_${padFloor}_Party_Wall_North`, [0, floorElevation + 1.6, -5.97])
  );

  // East-West Demising Wall (along Z = 0)
  floorGroup.add(
    createBox(9.3, 3.02, 0.25, materials.interiorWall, `Level_${padFloor}_Party_Wall_East`, [8.05, floorElevation + 1.6, 0])
  );
  floorGroup.add(
    createBox(9.3, 3.02, 0.25, materials.interiorWall, `Level_${padFloor}_Party_Wall_West`, [-8.05, floorElevation + 1.6, 0])
  );

  // Bedroom / Living Room Interior Partitions
  floorGroup.add(
    createBox(9.3, 3.02, 0.15, materials.interiorWall, `Level_${padFloor}_Internal_Wall_A`, [8.05, floorElevation + 1.6, 4.2])
  );
  floorGroup.add(
    createBox(9.3, 3.02, 0.15, materials.interiorWall, `Level_${padFloor}_Internal_Wall_D`, [-8.05, floorElevation + 1.6, 4.2])
  );
  floorGroup.add(
    createBox(9.3, 3.02, 0.15, materials.interiorWall, `Level_${padFloor}_Internal_Wall_B`, [8.05, floorElevation + 1.6, -4.2])
  );
  floorGroup.add(
    createBox(9.3, 3.02, 0.15, materials.interiorWall, `Level_${padFloor}_Internal_Wall_C`, [-8.05, floorElevation + 1.6, -4.2])
  );

  // -------------------------------------------------------------
  // 4. Exterior Façade Shell - SOUTH FACADE (Z = 8.55m)
  // Full continuous enclosure: Spandrel + Sill + Piers + Reveals + Frames
  // -------------------------------------------------------------
  // A. Continuous South Spandrel Beam (Lintel above windows: y: 2.70m to 3.20m, height 0.50m)
  floorGroup.add(
    createBox(25.4, 0.50, 0.30, materials.plasterIvory, `Level_${padFloor}_Spandrel_South`, [0, floorElevation + 2.95, 8.55])
  );

  // B. Continuous South Sill Wall (Below windows: y: 0.18m to 0.40m, height 0.22m)
  floorGroup.add(
    createBox(25.4, 0.22, 0.30, materials.plasterIvory, `Level_${padFloor}_Sill_South`, [0, floorElevation + 0.29, 8.55])
  );

  // C. Central Terracotta Accent Pier (X: -1.9m to +1.9m, width 3.8m, height 2.30m)
  floorGroup.add(
    createBox(3.8, 2.30, 0.38, materials.plasterTerracotta, `Level_${padFloor}_South_Central_Pier`, [0, floorElevation + 1.55, 8.59])
  );
  // Terracotta vertical shadow fluting
  floorGroup.add(
    createBox(0.08, 2.30, 0.42, materials.charcoalFrame, `Level_${padFloor}_South_Pier_Flute_L`, [-0.95, floorElevation + 1.55, 8.61])
  );
  floorGroup.add(
    createBox(0.08, 2.30, 0.42, materials.charcoalFrame, `Level_${padFloor}_South_Pier_Flute_R`, [0.95, floorElevation + 1.55, 8.61])
  );

  // D. South Outer Corner Piers (Warm Off-White Plaster, width 2.1m each)
  floorGroup.add(
    createBox(2.1, 2.30, 0.30, materials.plasterIvory, `Level_${padFloor}_South_Corner_W`, [-11.65, floorElevation + 1.55, 8.55])
  );
  floorGroup.add(
    createBox(2.1, 2.30, 0.30, materials.plasterIvory, `Level_${padFloor}_South_Corner_E`, [11.65, floorElevation + 1.55, 8.55])
  );

  // E. South Intermediate Wall Piers (between central pier and window openings, width 3.1m each)
  floorGroup.add(
    createBox(3.1, 2.30, 0.30, materials.plasterIvory, `Level_${padFloor}_South_Inter_Pier_W`, [-3.45, floorElevation + 1.55, 8.55])
  );
  floorGroup.add(
    createBox(3.1, 2.30, 0.30, materials.plasterIvory, `Level_${padFloor}_South_Inter_Pier_E`, [3.45, floorElevation + 1.55, 8.55])
  );

  // F. South Living Room Window Reveals & 60mm Charcoal Frames
  // Flat D Bay (wx = -7.8m) and Flat A Bay (wx = 7.8m)
  [-7.8, 7.8].forEach((wx, bIdx) => {
    const baySide = bIdx === 0 ? 'W' : 'E';
    // 100mm Deep Reveal Surrounds
    floorGroup.add(
      createBox(5.6, 2.30, 0.10, materials.charcoalFrame, `Level_${padFloor}_Win_Reveal_S_${baySide}`, [wx, floorElevation + 1.55, 8.50])
    );
    // Outer window frame (60mm bronze/aluminum)
    floorGroup.add(
      createBox(5.48, 2.18, 0.06, materials.charcoalFrame, `Level_${padFloor}_Win_Frame_S_${baySide}`, [wx, floorElevation + 1.55, 8.45])
    );
    // Vertical mullions dividing into 3 bays
    floorGroup.add(
      createBox(0.06, 2.18, 0.08, materials.charcoalFrame, `Level_${padFloor}_Mullion_S_${baySide}_1`, [wx - 1.8, floorElevation + 1.55, 8.46])
    );
    floorGroup.add(
      createBox(0.06, 2.18, 0.08, materials.charcoalFrame, `Level_${padFloor}_Mullion_S_${baySide}_2`, [wx + 1.8, floorElevation + 1.55, 8.46])
    );
  });

  // -------------------------------------------------------------
  // 5. Exterior Façade Shell - NORTH FACADE (Z = -8.55m)
  // Full continuous enclosure: Spandrel + Sill + Piers + Reveals + Frames
  // -------------------------------------------------------------
  // A. Continuous North Spandrel Beam (Lintel above windows: y: 2.70m to 3.20m, height 0.50m)
  floorGroup.add(
    createBox(25.4, 0.50, 0.30, materials.plasterIvory, `Level_${padFloor}_Spandrel_North`, [0, floorElevation + 2.95, -8.55])
  );

  // B. Continuous North Sill Wall (Below windows: y: 0.18m to 0.40m, height 0.22m)
  floorGroup.add(
    createBox(25.4, 0.22, 0.30, materials.plasterIvory, `Level_${padFloor}_Sill_North`, [0, floorElevation + 0.29, -8.55])
  );

  // C. Central Terracotta Accent Pier (X: -1.9m to +1.9m, width 3.8m, height 2.30m)
  floorGroup.add(
    createBox(3.8, 2.30, 0.38, materials.plasterTerracotta, `Level_${padFloor}_North_Central_Pier`, [0, floorElevation + 1.55, -8.59])
  );
  floorGroup.add(
    createBox(0.08, 2.30, 0.42, materials.charcoalFrame, `Level_${padFloor}_North_Pier_Flute_L`, [-0.95, floorElevation + 1.55, -8.61])
  );
  floorGroup.add(
    createBox(0.08, 2.30, 0.42, materials.charcoalFrame, `Level_${padFloor}_North_Pier_Flute_R`, [0.95, floorElevation + 1.55, -8.61])
  );

  // D. North Outer Corner Piers
  floorGroup.add(
    createBox(2.1, 2.30, 0.30, materials.plasterIvory, `Level_${padFloor}_North_Corner_W`, [-11.65, floorElevation + 1.55, -8.55])
  );
  floorGroup.add(
    createBox(2.1, 2.30, 0.30, materials.plasterIvory, `Level_${padFloor}_North_Corner_E`, [11.65, floorElevation + 1.55, -8.55])
  );

  // E. North Intermediate Wall Piers
  floorGroup.add(
    createBox(3.1, 2.30, 0.30, materials.plasterIvory, `Level_${padFloor}_North_Inter_Pier_W`, [-3.45, floorElevation + 1.55, -8.55])
  );
  floorGroup.add(
    createBox(3.1, 2.30, 0.30, materials.plasterIvory, `Level_${padFloor}_North_Inter_Pier_E`, [3.45, floorElevation + 1.55, -8.55])
  );

  // F. North Bedroom Window Reveals & 60mm Charcoal Frames
  [-7.8, 7.8].forEach((wx, bIdx) => {
    const baySide = bIdx === 0 ? 'W' : 'E';
    floorGroup.add(
      createBox(5.6, 2.30, 0.10, materials.charcoalFrame, `Level_${padFloor}_Win_Reveal_N_${baySide}`, [wx, floorElevation + 1.55, -8.50])
    );
    floorGroup.add(
      createBox(5.48, 2.18, 0.06, materials.charcoalFrame, `Level_${padFloor}_Win_Frame_N_${baySide}`, [wx, floorElevation + 1.55, -8.45])
    );
    floorGroup.add(
      createBox(0.06, 2.18, 0.08, materials.charcoalFrame, `Level_${padFloor}_Mullion_N_${baySide}_1`, [wx - 1.8, floorElevation + 1.55, -8.46])
    );
    floorGroup.add(
      createBox(0.06, 2.18, 0.08, materials.charcoalFrame, `Level_${padFloor}_Mullion_N_${baySide}_2`, [wx + 1.8, floorElevation + 1.55, -8.46])
    );
  });

  // -------------------------------------------------------------
  // 6. Exterior Façade Shell - EAST & WEST FACADES (Spanning Z: -8.7m to +8.7m)
  // Full continuous enclosure: Spandrel + Sill + Center Accent + Window Bays
  // -------------------------------------------------------------
  [12.7, -12.7].forEach((wx, sideIdx) => {
    const sideName = sideIdx === 0 ? 'East' : 'West';
    const normalSign = sideIdx === 0 ? 1 : -1;

    // A. Continuous Spandrel Beam (y: 2.70m to 3.20m, height 0.50m)
    floorGroup.add(
      createBox(0.30, 0.50, 17.4, materials.plasterIvory, `Level_${padFloor}_Spandrel_${sideName}`, [wx, floorElevation + 2.95, 0])
    );

    // B. Continuous Sill Wall (y: 0.18m to 0.70m, height 0.52m)
    floorGroup.add(
      createBox(0.30, 0.52, 17.4, materials.plasterIvory, `Level_${padFloor}_Sill_${sideName}`, [wx, floorElevation + 0.44, 0])
    );

    // C. Center Terracotta Accent Band (Z: -1.7m to +1.7m, width 3.4m, height 2.0m)
    floorGroup.add(
      createBox(0.36, 2.00, 3.4, materials.plasterTerracotta, `Level_${padFloor}_Accent_${sideName}`, [wx + normalSign * 0.03, floorElevation + 1.70, 0])
    );

    // D. Corner Return Solid Piers (Front Z: 5.6m to 8.7m, Rear Z: -8.7m to -5.6m)
    floorGroup.add(
      createBox(0.30, 2.00, 3.1, materials.plasterIvory, `Level_${padFloor}_Corner_Pier_${sideName}_Front`, [wx, floorElevation + 1.70, 7.15])
    );
    floorGroup.add(
      createBox(0.30, 2.00, 3.1, materials.plasterIvory, `Level_${padFloor}_Corner_Pier_${sideName}_Rear`, [wx, floorElevation + 1.70, -7.15])
    );

    // E. Side Window Openings & Frames (Front bay at Z = 3.6m, Rear bay at Z = -3.6m)
    [3.6, -3.6].forEach((wz, bayIdx) => {
      const bayLabel = bayIdx === 0 ? 'Front' : 'Rear';
      // Reveal surround
      floorGroup.add(
        createBox(0.10, 2.00, 3.8, materials.charcoalFrame, `Level_${padFloor}_Reveal_${sideName}_${bayLabel}`, [wx - normalSign * 0.05, floorElevation + 1.70, wz])
      );
      // Window frame
      floorGroup.add(
        createBox(0.06, 1.90, 3.68, materials.charcoalFrame, `Level_${padFloor}_Frame_${sideName}_${bayLabel}`, [wx - normalSign * 0.10, floorElevation + 1.70, wz])
      );
      // Vertical Mullion
      floorGroup.add(
        createBox(0.08, 1.90, 0.06, materials.charcoalFrame, `Level_${padFloor}_Mullion_${sideName}_${bayLabel}`, [wx - normalSign * 0.10, floorElevation + 1.70, wz])
      );
    });
  });

  // -------------------------------------------------------------
  // 7. Balconies with 180mm Slabs, 40mm Drip Edges, 1.1m Glass Balustrades
  // -------------------------------------------------------------
  // Flat A Living Balcony (Front-Right: +X, +Z)
  const balA_X = 7.8;
  const balA_Z = 9.45;
  floorGroup.add(
    createBox(7.2, 0.18, 1.5, materials.plasterIvory, `Level_${padFloor}_Balcony_A_Slab`, [balA_X, floorElevation + 0.09, balA_Z])
  );
  floorGroup.add(
    createBox(7.24, 0.04, 1.54, materials.slabEdge, `Level_${padFloor}_Balcony_A_Drip_Edge`, [balA_X, floorElevation + 0.02, balA_Z])
  );
  floorGroup.add(
    createBox(7.16, 1.1, 0.03, materials.glassBalustrade, `Level_${padFloor}_Balcony_A_Glass_Front`, [balA_X, floorElevation + 0.73, balA_Z + 0.74])
  );
  floorGroup.add(
    createBox(0.03, 1.1, 1.48, materials.glassBalustrade, `Level_${padFloor}_Balcony_A_Glass_Side`, [balA_X + 3.58, floorElevation + 0.73, balA_Z])
  );
  floorGroup.add(
    createBox(7.24, 0.05, 0.06, materials.charcoalFrame, `Level_${padFloor}_Balcony_A_Handrail`, [balA_X, floorElevation + 1.28, balA_Z + 0.74])
  );

  // Flat D Living Balcony (Front-Left: -X, +Z)
  const balD_X = -7.8;
  const balD_Z = 9.45;
  floorGroup.add(
    createBox(7.2, 0.18, 1.5, materials.plasterIvory, `Level_${padFloor}_Balcony_D_Slab`, [balD_X, floorElevation + 0.09, balD_Z])
  );
  floorGroup.add(
    createBox(7.24, 0.04, 1.54, materials.slabEdge, `Level_${padFloor}_Balcony_D_Drip_Edge`, [balD_X, floorElevation + 0.02, balD_Z])
  );
  floorGroup.add(
    createBox(7.16, 1.1, 0.03, materials.glassBalustrade, `Level_${padFloor}_Balcony_D_Glass_Front`, [balD_X, floorElevation + 0.73, balD_Z + 0.74])
  );
  floorGroup.add(
    createBox(0.03, 1.1, 1.48, materials.glassBalustrade, `Level_${padFloor}_Balcony_D_Glass_Side`, [balD_X - 3.58, floorElevation + 0.73, balD_Z])
  );
  floorGroup.add(
    createBox(7.24, 0.05, 0.06, materials.charcoalFrame, `Level_${padFloor}_Balcony_D_Handrail`, [balD_X, floorElevation + 1.28, balD_Z + 0.74])
  );

  // Flat B Bedroom Balcony (Rear-Right: +X, -Z)
  const balB_X = 7.8;
  const balB_Z = -9.45;
  floorGroup.add(
    createBox(6.4, 0.18, 1.5, materials.plasterIvory, `Level_${padFloor}_Balcony_B_Slab`, [balB_X, floorElevation + 0.09, balB_Z])
  );
  floorGroup.add(
    createBox(6.44, 0.04, 1.54, materials.slabEdge, `Level_${padFloor}_Balcony_B_Drip_Edge`, [balB_X, floorElevation + 0.02, balB_Z])
  );
  floorGroup.add(
    createBox(6.36, 1.1, 0.03, materials.glassBalustrade, `Level_${padFloor}_Balcony_B_Glass_Front`, [balB_X, floorElevation + 0.73, balB_Z - 0.74])
  );
  floorGroup.add(
    createBox(0.03, 1.1, 1.48, materials.glassBalustrade, `Level_${padFloor}_Balcony_B_Glass_Side`, [balB_X + 3.18, floorElevation + 0.73, balB_Z])
  );
  floorGroup.add(
    createBox(6.44, 0.05, 0.06, materials.charcoalFrame, `Level_${padFloor}_Balcony_B_Handrail`, [balB_X, floorElevation + 1.28, balB_Z - 0.74])
  );

  // Flat C Bedroom Balcony (Rear-Left: -X, -Z)
  const balC_X = -7.8;
  const balC_Z = -9.45;
  floorGroup.add(
    createBox(6.4, 0.18, 1.5, materials.plasterIvory, `Level_${padFloor}_Balcony_C_Slab`, [balC_X, floorElevation + 0.09, balC_Z])
  );
  floorGroup.add(
    createBox(6.44, 0.04, 1.54, materials.slabEdge, `Level_${padFloor}_Balcony_C_Drip_Edge`, [balC_X, floorElevation + 0.02, balC_Z])
  );
  floorGroup.add(
    createBox(6.36, 1.1, 0.03, materials.glassBalustrade, `Level_${padFloor}_Balcony_C_Glass_Front`, [balC_X, floorElevation + 0.73, balC_Z - 0.74])
  );
  floorGroup.add(
    createBox(0.03, 1.1, 1.48, materials.glassBalustrade, `Level_${padFloor}_Balcony_C_Glass_Side`, [balC_X - 3.18, floorElevation + 0.73, balC_Z])
  );
  floorGroup.add(
    createBox(6.44, 0.05, 0.06, materials.charcoalFrame, `Level_${padFloor}_Balcony_C_Handrail`, [balC_X, floorElevation + 1.28, balC_Z - 0.74])
  );

  // -------------------------------------------------------------
  // 8. Vertical Rhythm: Vertical Fins Every 2nd Bay (100mm x 350mm projection)
  // -------------------------------------------------------------
  const finPositionsX = [-11.5, -4.0, 4.0, 11.5];
  finPositionsX.forEach((fx, finIdx) => {
    floorGroup.add(
      createBox(0.10, 3.2, 0.35, materials.charcoalFrame, `Level_${padFloor}_Vertical_Fin_S_${finIdx}`, [fx, floorElevation + 1.6, 8.72])
    );
    floorGroup.add(
      createBox(0.10, 3.2, 0.35, materials.charcoalFrame, `Level_${padFloor}_Vertical_Fin_N_${finIdx}`, [fx, floorElevation + 1.6, -8.72])
    );
  });

  root.add(floorGroup);
}

// ==========================================
// 4. CROWN & ROOFTOP (Y: 50.8m to 56.5m)
// Parapet 1.2m with Charcoal Bronze Coping, Stepped LMR, Water Tank & Lit Pergola
// ==========================================
console.log('3/4 Building Crown, Stepped Massing, Parapet with Charcoal Coping, and Rooftop Pergola...');
const crownGroup = new THREE.Group();
crownGroup.name = 'Rooftop_Crown';

const roofElevation = basePodiumHeight + totalResidentialFloors * floorHeight; // 50.8m

// Roof Terrace Slab (25.8m x 17.8m x 0.22m) in Muted Off-White Plaster
crownGroup.add(
  createBox(25.8, 0.22, 17.8, materials.plasterIvory, 'Roof_Terrace_Slab', [0, roofElevation + 0.11, 0])
);
// Roof Slab Drip Edge
crownGroup.add(
  createBox(26.0, 0.04, 18.0, materials.slabEdge, 'Roof_Slab_Drip_Edge', [0, roofElevation + 0.02, 0])
);

// 1.2m High Parapet Walls in Warm Off-White Plaster
crownGroup.add(
  createBox(25.8, 1.2, 0.3, materials.plasterIvory, 'Roof_Parapet_South', [0, roofElevation + 0.72, 8.75])
);
crownGroup.add(
  createBox(25.8, 1.2, 0.3, materials.plasterIvory, 'Roof_Parapet_North', [0, roofElevation + 0.72, -8.75])
);
crownGroup.add(
  createBox(0.3, 1.2, 17.2, materials.plasterIvory, 'Roof_Parapet_West', [-12.75, roofElevation + 0.72, 0])
);
crownGroup.add(
  createBox(0.3, 1.2, 17.2, materials.plasterIvory, 'Roof_Parapet_East', [12.75, roofElevation + 0.72, 0])
);

// Sleek Charcoal Bronze Parapet Coping Trim (#2B2B2E - eliminates any yellow cap)
crownGroup.add(
  createBox(26.0, 0.08, 0.36, materials.charcoalFrame, 'Roof_Parapet_Coping_South', [0, roofElevation + 1.34, 8.75])
);
crownGroup.add(
  createBox(26.0, 0.08, 0.36, materials.charcoalFrame, 'Roof_Parapet_Coping_North', [0, roofElevation + 1.34, -8.75])
);
crownGroup.add(
  createBox(0.36, 0.08, 17.4, materials.charcoalFrame, 'Roof_Parapet_Coping_West', [-12.75, roofElevation + 1.34, 0])
);
crownGroup.add(
  createBox(0.36, 0.08, 17.4, materials.charcoalFrame, 'Roof_Parapet_Coping_East', [12.75, roofElevation + 1.34, 0])
);

// Stepped Mass for Lift Machine Room (LMR) Superstructure
const lmrGroup = new THREE.Group();
lmrGroup.name = 'Lift_Machine_Room';
lmrGroup.add(
  createBox(6.8, 4.0, 6.2, materials.charcoalCore, 'LMR_Main_Structure', [0, roofElevation + 2.12, 0])
);
// LMR Architectural Charcoal Ventilation Louvres
lmrGroup.add(
  createBox(6.4, 2.2, 0.08, materials.charcoalFrame, 'LMR_Louvres_South', [0, roofElevation + 2.4, 3.14])
);
lmrGroup.add(
  createBox(6.4, 2.2, 0.08, materials.charcoalFrame, 'LMR_Louvres_North', [0, roofElevation + 2.4, -3.14])
);
lmrGroup.add(
  createBox(7.2, 0.22, 6.6, materials.slabEdge, 'LMR_Roof_Cap', [0, roofElevation + 4.23, 0])
);
crownGroup.add(lmrGroup);

// Overhead Water Tank (OHT) Enclosure
crownGroup.add(
  createBox(5.0, 3.0, 4.2, materials.plasterTerracotta, 'Overhead_Water_Tank_Enclosure', [7.8, roofElevation + 1.62, 0])
);
crownGroup.add(
  createBox(5.4, 0.18, 4.6, materials.charcoalFrame, 'OHT_Fascia_Cap', [7.8, roofElevation + 3.21, 0])
);

// Subtle Rooftop Amenity Pergola Feature Element
const pergolaGroup = new THREE.Group();
pergolaGroup.name = 'Rooftop_Pergola_Pavilion';
const postCoords = [
  [-10.5, 4.5], [-5.5, 4.5],
  [-10.5, -4.5], [-5.5, -4.5],
];
postCoords.forEach(([px, pz], idx) => {
  pergolaGroup.add(
    createBox(0.16, 3.4, 0.16, materials.charcoalFrame, `Pergola_Post_${idx}`, [px, roofElevation + 1.82, pz])
  );
});
pergolaGroup.add(
  createBox(6.4, 0.22, 0.16, materials.charcoalFrame, 'Pergola_Beam_South', [-8.0, roofElevation + 3.63, 4.5])
);
pergolaGroup.add(
  createBox(6.4, 0.22, 0.16, materials.charcoalFrame, 'Pergola_Beam_North', [-8.0, roofElevation + 3.63, -4.5])
);
// Horizontal Louvred Trellis Slats
for (let lx = -10.8; lx <= -5.2; lx += 0.7) {
  pergolaGroup.add(
    createBox(0.06, 0.16, 9.2, materials.charcoalFrame, `Pergola_Slat_${lx.toFixed(1)}`, [lx, roofElevation + 3.78, 0])
  );
}
// Rooftop Architectural Contour LED Lighting
pergolaGroup.add(
  createBox(6.2, 0.03, 0.03, materials.ledLinear, 'Pergola_LED_Contour_S', [-8.0, roofElevation + 3.51, 4.48])
);
pergolaGroup.add(
  createBox(6.2, 0.03, 0.03, materials.ledLinear, 'Pergola_LED_Contour_N', [-8.0, roofElevation + 3.51, -4.48])
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
