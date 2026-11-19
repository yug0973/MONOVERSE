import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ContactShadows } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';

/**
 * Procedural Organic Foliage Alpha Texture Generator
 * Creates realistic architectural tree canopy silhouettes with natural leaf cluster outlines
 */
function createFoliageAlphaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Solid black background (transparent in alphaMap)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 256, 320);

  // Overlapping organic leaf mass clusters
  const clusters = [
    { x: 128, y: 72, r: 40 },
    { x: 96, y: 108, r: 50 },
    { x: 160, y: 108, r: 50 },
    { x: 74, y: 156, r: 54 },
    { x: 182, y: 156, r: 54 },
    { x: 128, y: 150, r: 64 },
    { x: 88, y: 206, r: 48 },
    { x: 168, y: 206, r: 48 },
    { x: 128, y: 222, r: 46 },
  ];

  ctx.fillStyle = '#FFFFFF';
  clusters.forEach(({ x, y, r }) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Stippled leaf clumps along perimeter for organic botanical edge
  for (let a = 0; a < Math.PI * 2; a += 0.07) {
    const rBase = 72 + Math.sin(a * 6) * 16 + Math.cos(a * 9) * 8;
    const rx = 128 + Math.cos(a) * rBase;
    const ry = 148 + Math.sin(a) * (rBase * 1.15);
    ctx.beginPath();
    ctx.arc(rx, ry, 11 + Math.sin(a * 13) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

/**
 * Senior Architectural Landscaped Base Plate & Context Rig
 * - Expansive 450m ground apron fading softly into the HDRI horizon with fog
 * - Realistic instanced crossed-plane architectural trees with organic alpha foliage and ground contact shadows
 * - Layered contextual distant skyline with textured window grids and stepped penthouse profiles
 * - Paved arrival plaza, curved asphalt driveway with lane markings, curbs, boundary wall, and podium gardens
 */
export const BasePlate: React.FC = () => {
  const { viewMode, isLiteQuality } = useAppStore();

  const foliageAlphaTex = useMemo(() => createFoliageAlphaTexture(), []);

  // 1. Generate Instanced Tree Transforms in 3 Species (48 perimeter & garden trees)
  const { treeTrunkMatrices, treePlane1Matrices, treePlane2Matrices, treeShadowPositions } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const trunkMats: THREE.Matrix4[] = [];
    const p1Mats: THREE.Matrix4[] = [];
    const p2Mats: THREE.Matrix4[] = [];
    const shadowPos: [number, number, number, number][] = [];

    // Tree placement coords along boulevard, podium perimeter, and boundary gardens
    const treePositions: [number, number, number, number][] = [
      // Along entrance boulevard (East side)
      [18, 0, 16, 1.1],
      [18, 0, 24, 0.95],
      [18, 0, 32, 1.15],
      [18, 0, 40, 1.0],
      [26, 0, 18, 1.2],
      [26, 0, 28, 1.05],
      [26, 0, 38, 1.1],

      // Along entrance boulevard (West side)
      [-18, 0, 16, 1.0],
      [-18, 0, 24, 1.2],
      [-18, 0, 32, 1.05],
      [-18, 0, 40, 1.15],
      [-26, 0, 18, 0.9],
      [-26, 0, 28, 1.1],
      [-26, 0, 38, 1.05],

      // Poolside & Sun Deck Gardens
      [24, 0, -6, 1.0],
      [24, 0, -14, 1.15],
      [24, 0, -22, 1.05],
      [24, 0, -30, 0.95],
      [30, 0, -10, 1.2],
      [30, 0, -20, 1.1],

      // West Courtyard & Zen Garden
      [-24, 0, -6, 1.1],
      [-24, 0, -14, 0.95],
      [-24, 0, -22, 1.15],
      [-24, 0, -30, 1.05],
      [-30, 0, -10, 1.0],
      [-30, 0, -20, 1.2],

      // Rear Waterfront Promenade perimeter
      [-16, 0, -42, 1.1],
      [-8, 0, -44, 1.05],
      [0, 0, -45, 1.2],
      [8, 0, -44, 1.15],
      [16, 0, -42, 1.0],

      // Outer Perimeter screening clusters
      [38, 0, 8, 1.3],
      [42, 0, -4, 1.25],
      [40, 0, -18, 1.2],
      [-38, 0, 8, 1.2],
      [-42, 0, -4, 1.3],
      [-40, 0, -18, 1.25],
      [44, 0, 24, 1.1],
      [-44, 0, 24, 1.15],
      [48, 0, 36, 1.2],
      [-48, 0, 36, 1.25],
    ];

    treePositions.forEach(([x, y, z, s], idx) => {
      // 3 Architectural Species Profile:
      // Species 0: Columnar Ashoka / Royal Palm (slender tall)
      // Species 1: Spreading Neem / Gulmohar (broad canopy)
      // Species 2: Compact Ficus (dense dome)
      const species = idx % 3;
      const aspectX = species === 0 ? 0.85 : species === 1 ? 1.25 : 1.05;
      const aspectY = species === 0 ? 1.35 : species === 1 ? 1.05 : 1.0;

      // Trunk transform
      dummy.position.set(x, y + 1.8 * s * aspectY, z);
      dummy.scale.set(s, s * aspectY, s);
      dummy.rotation.set(0, (x + z) * 0.45, 0);
      dummy.updateMatrix();
      trunkMats.push(dummy.matrix.clone());

      // Crossed-Plane 1 (0 deg rotation)
      dummy.position.set(x, y + 4.2 * s * aspectY, z);
      dummy.scale.set(s * aspectX, s * aspectY, s * aspectX);
      dummy.rotation.set(0, (x * 0.1) % Math.PI, 0);
      dummy.updateMatrix();
      p1Mats.push(dummy.matrix.clone());

      // Crossed-Plane 2 (90 deg perpendicular rotation)
      dummy.rotation.set(0, ((x * 0.1) % Math.PI) + Math.PI / 2, 0);
      dummy.updateMatrix();
      p2Mats.push(dummy.matrix.clone());

      // Ground contact shadow disc
      shadowPos.push([x, 0.03, z, 3.4 * s * aspectX]);
    });

    return {
      treeTrunkMatrices: trunkMats,
      treePlane1Matrices: p1Mats,
      treePlane2Matrices: p2Mats,
      treeShadowPositions: shadowPos,
    };
  }, []);

  // 2. Generate Distant Context Skyline Building Massings (Varied heights & window banding)
  const distantBuildings = useMemo(() => {
    return [
      // North-East cluster (Modern commercial & residential towers)
      { pos: [95, 18, -85], size: [18, 36, 16], rot: 0.25, floors: 11 },
      { pos: [120, 24, -60], size: [22, 48, 20], rot: -0.1, floors: 15 },
      { pos: [145, 15, -95], size: [26, 30, 24], rot: 0.4, floors: 9 },
      { pos: [80, 28, -125], size: [16, 56, 16], rot: 0.15, floors: 18 },

      // North-West cluster (High-rise residential silhouette)
      { pos: [-90, 22, -85], size: [20, 44, 18], rot: -0.2, floors: 14 },
      { pos: [-115, 27, -55], size: [24, 54, 22], rot: 0.15, floors: 17 },
      { pos: [-140, 16, -90], size: [28, 32, 26], rot: -0.35, floors: 10 },
      { pos: [-75, 30, -120], size: [18, 60, 18], rot: 0.05, floors: 19 },

      // South-East horizon massing
      { pos: [110, 14, 75], size: [22, 28, 20], rot: -0.3, floors: 9 },
      { pos: [135, 19, 95], size: [18, 38, 18], rot: 0.2, floors: 12 },

      // South-West horizon massing
      { pos: [-105, 14, 75], size: [22, 28, 20], rot: 0.3, floors: 9 },
      { pos: [-130, 19, 95], size: [18, 38, 18], rot: -0.2, floors: 12 },
    ];
  }, []);

  // Crossed plane geometry for architectural tree canopies
  const foliagePlaneGeom = useMemo(() => {
    const geom = new THREE.PlaneGeometry(4.6, 5.4);
    geom.computeVertexNormals();
    return geom;
  }, []);

  // Hide surroundings when inside an individual apartment flat
  if (viewMode === 'dollhouse' || viewMode === 'walkthrough') {
    return null;
  }

  return (
    <group position={[0, -0.01, 0]}>
      {/* ========================================================
          1. REAL GROUND CONTACT SHADOW (Drei ContactShadows)
         ======================================================== */}
      {!isLiteQuality && (
        <ContactShadows
          position={[0, 0.02, 0]}
          opacity={0.68}
          scale={54}
          blur={1.8}
          far={18}
          resolution={1024}
          frames={1}
          color="#0B111A"
        />
      )}

      {/* ========================================================
          2. EXPANSIVE GROUND APRON (450m x 450m Fading into Horizon Fog)
         ======================================================== */}
      <mesh receiveShadow position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[450, 450, 32, 32]} />
        <meshStandardMaterial
          color="#2E3C2C"
          roughness={0.96}
          metalness={0.0}
        />
      </mesh>

      {/* ========================================================
          3. ARRIVAL PLAZA & ENTRANCE MOTOR COURT
         ======================================================== */}
      {/* Honed Stone Pedestrian Plaza */}
      <mesh receiveShadow position={[0, 0.03, 8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 26]} />
        <meshStandardMaterial
          color="#8C7B6B"
          roughness={0.82}
          metalness={0.03}
        />
      </mesh>

      {/* Main Internal Asphalt Driveway & Drop-Off Loop */}
      <mesh receiveShadow position={[0, 0.02, 28]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[56, 16]} />
        <meshStandardMaterial
          color="#282B30"
          roughness={0.92}
          metalness={0.02}
        />
      </mesh>

      {/* Driveway Centerline Lane Marking */}
      <mesh position={[0, 0.025, 28]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[48, 0.2]} />
        <meshBasicMaterial color="#EAEAEA" opacity={0.8} transparent />
      </mesh>

      {/* Concrete Beveled Curbs */}
      <mesh receiveShadow position={[0, 0.08, 19.9]}>
        <boxGeometry args={[56, 0.14, 0.25]} />
        <meshStandardMaterial color="#8C7B6B" roughness={0.78} />
      </mesh>
      <mesh receiveShadow position={[0, 0.08, 36.1]}>
        <boxGeometry args={[56, 0.14, 0.25]} />
        <meshStandardMaterial color="#8C7B6B" roughness={0.78} />
      </mesh>

      {/* ========================================================
          4. LANDSCAPED GARDENS & MULTI-TIERED LAWNS
         ======================================================== */}
      {/* East Landscape Lawn */}
      <mesh receiveShadow position={[28, 0.04, 8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 26]} />
        <meshStandardMaterial
          color="#2C4428"
          roughness={0.96}
          metalness={0.0}
        />
      </mesh>

      {/* West Landscape Lawn */}
      <mesh receiveShadow position={[-28, 0.04, 8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 26]} />
        <meshStandardMaterial
          color="#2C4428"
          roughness={0.96}
          metalness={0.0}
        />
      </mesh>

      {/* Low Stone Planter Border Walls */}
      <mesh receiveShadow position={[18, 0.22, 8]}>
        <boxGeometry args={[0.3, 0.4, 26]} />
        <meshStandardMaterial color="#6B6258" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[-18, 0.22, 8]}>
        <boxGeometry args={[0.3, 0.4, 26]} />
        <meshStandardMaterial color="#6B6258" roughness={0.85} />
      </mesh>

      {/* ========================================================
          5. PODIUM REAR SWIMMING POOL & DECK
         ======================================================== */}
      {/* Honed Stone Pool Deck */}
      <mesh receiveShadow position={[0, 0.04, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 18]} />
        <meshStandardMaterial
          color="#8C7B6B"
          roughness={0.78}
          metalness={0.03}
        />
      </mesh>

      {/* Resort Lap Pool Water Basin */}
      <mesh receiveShadow position={[0, 0.03, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 10]} />
        <meshStandardMaterial
          color="#1688A8"
          roughness={0.08}
          metalness={0.15}
        />
      </mesh>

      {/* ========================================================
          6. INSTANCED CROSSED-PLANE TREES WITH ORGANIC ALPHA & CONTACT SHADOWS
         ======================================================== */}
      {/* Tree Trunks */}
      <instancedMesh
        args={[undefined as any, undefined as any, treeTrunkMatrices.length]}
        castShadow
        receiveShadow
        onUpdate={(self) => {
          treeTrunkMatrices.forEach((mat, i) => self.setMatrixAt(i, mat));
          self.instanceMatrix.needsUpdate = true;
        }}
      >
        <cylinderGeometry args={[0.14, 0.26, 3.6, 8]} />
        <meshStandardMaterial color="#3D322A" roughness={0.92} />
      </instancedMesh>

      {/* Foliage Crossed-Plane 1 with Botanical Alpha Silhouette */}
      <instancedMesh
        args={[undefined as any, undefined as any, treePlane1Matrices.length]}
        castShadow
        receiveShadow
        onUpdate={(self) => {
          treePlane1Matrices.forEach((mat, i) => self.setMatrixAt(i, mat));
          self.instanceMatrix.needsUpdate = true;
        }}
      >
        <primitive object={foliagePlaneGeom} attach="geometry" />
        <meshStandardMaterial
          color="#2A4824"
          roughness={0.82}
          metalness={0.0}
          alphaMap={foliageAlphaTex}
          transparent={true}
          alphaTest={0.4}
          depthWrite={true}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* Foliage Crossed-Plane 2 (Perpendicular) */}
      <instancedMesh
        args={[undefined as any, undefined as any, treePlane2Matrices.length]}
        castShadow
        receiveShadow
        onUpdate={(self) => {
          treePlane2Matrices.forEach((mat, i) => self.setMatrixAt(i, mat));
          self.instanceMatrix.needsUpdate = true;
        }}
      >
        <primitive object={foliagePlaneGeom} attach="geometry" />
        <meshStandardMaterial
          color="#223C1E"
          roughness={0.82}
          metalness={0.0}
          alphaMap={foliageAlphaTex}
          transparent={true}
          alphaTest={0.4}
          depthWrite={true}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* Ground Contact Shadow Discs Under Trees */}
      <group>
        {treeShadowPositions.map(([sx, sy, sz, diam], sIdx) => (
          <mesh key={`tree-shadow-${sIdx}`} position={[sx, sy, sz]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[diam * 0.45, 16]} />
            <meshBasicMaterial
              color="#0B130E"
              transparent
              opacity={0.45}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          7. DISTANT CONTEXT SKYLINE (Textured Window Grids & Stepped Massings)
         ======================================================== */}
      <group>
        {distantBuildings.map((b, idx) => (
          <group key={`dist-bldg-${idx}`} position={b.pos as [number, number, number]} rotation={[0, b.rot, 0]}>
            {/* Main Tower Massing (Muted architectural concrete) */}
            <mesh receiveShadow>
              <boxGeometry args={b.size as [number, number, number]} />
              <meshStandardMaterial
                color="#4E555E"
                roughness={0.88}
                metalness={0.08}
              />
            </mesh>

            {/* Stepped Penthouse Crown */}
            <mesh position={[0, b.size[1] / 2 + 2, 0]}>
              <boxGeometry args={[b.size[0] * 0.7, 4, b.size[2] * 0.7]} />
              <meshStandardMaterial
                color="#3A4048"
                roughness={0.82}
                metalness={0.15}
              />
            </mesh>

            {/* Textured Window Grid Facade Panels (Front & Rear) */}
            <mesh position={[0, 0, b.size[2] / 2 + 0.05]}>
              <planeGeometry args={[b.size[0] * 0.88, b.size[1] * 0.85]} />
              <meshStandardMaterial
                color="#1C242D"
                roughness={0.35}
                metalness={0.35}
              />
            </mesh>
            <mesh position={[0, 0, -b.size[2] / 2 - 0.05]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[b.size[0] * 0.88, b.size[1] * 0.85]} />
              <meshStandardMaterial
                color="#1C242D"
                roughness={0.35}
                metalness={0.35}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
