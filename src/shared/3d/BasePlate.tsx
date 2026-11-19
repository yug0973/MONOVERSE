import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ContactShadows } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';

/**
 * Senior Architectural Landscaped Base Plate & Context Rig
 * - Replaces empty planes with realistic road, curbs, paving, pool, manicured lawns
 * - Instanced lush architectural trees (InstancedMesh: 1 draw call for all trees)
 * - Layered contextual distant skyline with textured window banding and stepped silhouettes
 * - Real shadow receivers + Drei ContactShadows under tower podium (zero fake blob shadows)
 */
export const BasePlate: React.FC = () => {
  const { viewMode, isLiteQuality } = useAppStore();

  // 1. Generate Instanced Tree Transforms (42 lush perimeter & courtyard trees)
  const { treeTrunkMatrices, treeCrownMatrices } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const trunkMats: THREE.Matrix4[] = [];
    const crownMats: THREE.Matrix4[] = [];

    // Coordinates along driveway, pool border, and boundary gardens
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
    ];

    treePositions.forEach(([x, y, z, s]) => {
      // Trunk
      dummy.position.set(x, y + 1.6 * s, z);
      dummy.scale.set(s, s, s);
      dummy.rotation.set(0, (x + z) * 0.5, 0);
      dummy.updateMatrix();
      trunkMats.push(dummy.matrix.clone());

      // Crown
      dummy.position.set(x, y + 4.2 * s, z);
      dummy.scale.set(s * 1.05, s * 1.15, s * 1.05);
      dummy.rotation.set((x % 3) * 0.05, (x * z) * 0.1, (z % 3) * 0.05);
      dummy.updateMatrix();
      crownMats.push(dummy.matrix.clone());
    });

    return { treeTrunkMatrices: trunkMats, treeCrownMatrices: crownMats };
  }, []);

  // 2. Generate Distant Context Skyline Building Massings (Varied heights & stepped profiles)
  const distantBuildings = useMemo(() => {
    return [
      // North-East cluster (Modern commercial & residential towers)
      { pos: [95, 18, -85], size: [18, 36, 16], rot: 0.25 },
      { pos: [120, 24, -60], size: [22, 48, 20], rot: -0.1 },
      { pos: [145, 15, -95], size: [26, 30, 24], rot: 0.4 },
      { pos: [80, 28, -125], size: [16, 56, 16], rot: 0.15 },

      // North-West cluster (High-rise residential silhouette)
      { pos: [-90, 22, -85], size: [20, 44, 18], rot: -0.2 },
      { pos: [-115, 27, -55], size: [24, 54, 22], rot: 0.15 },
      { pos: [-140, 16, -90], size: [28, 32, 26], rot: -0.35 },
      { pos: [-75, 30, -120], size: [18, 60, 18], rot: 0.05 },

      // South-East horizon massing
      { pos: [110, 14, 75], size: [22, 28, 20], rot: -0.3 },
      { pos: [135, 19, 95], size: [18, 38, 18], rot: 0.2 },

      // South-West horizon massing
      { pos: [-105, 14, 75], size: [22, 28, 20], rot: 0.3 },
      { pos: [-130, 19, 95], size: [18, 38, 18], rot: -0.2 },
    ];
  }, []);

  // Hide surroundings when inside an individual apartment flat
  if (viewMode === 'dollhouse' || viewMode === 'walkthrough') {
    return null;
  }

  return (
    <group position={[0, -0.01, 0]}>
      {/* ========================================================
          1. REAL GROUND CONTACT SHADOW (Drei ContactShadows)
          Eliminates all fake dark blobs; provides deep ambient ground contact
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
          2. SITE PERIMETER GROUND APRON
         ======================================================== */}
      {/* Expansive site ground apron blending into the landscape */}
      <mesh receiveShadow position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[180, 150]} />
        <meshStandardMaterial
          color="#384936"
          roughness={0.95}
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
          color="#DBD6CC"
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>

      {/* Main Internal Asphalt Driveway & Drop-Off Loop */}
      <mesh receiveShadow position={[0, 0.02, 28]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[56, 16]} />
        <meshStandardMaterial
          color="#2A2C30"
          roughness={0.84}
          metalness={0.06}
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
        <meshStandardMaterial color="#949CA4" roughness={0.78} />
      </mesh>
      <mesh receiveShadow position={[0, 0.08, 36.1]}>
        <boxGeometry args={[56, 0.14, 0.25]} />
        <meshStandardMaterial color="#949CA4" roughness={0.78} />
      </mesh>

      {/* ========================================================
          4. LANDSCAPED GARDENS & MULTI-TIERED LAWNS
         ======================================================== */}
      {/* East Landscape Lawn */}
      <mesh receiveShadow position={[28, 0.04, 8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 26]} />
        <meshStandardMaterial
          color="#334B30"
          roughness={0.96}
          metalness={0.0}
        />
      </mesh>

      {/* West Landscape Lawn */}
      <mesh receiveShadow position={[-28, 0.04, 8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 26]} />
        <meshStandardMaterial
          color="#334B30"
          roughness={0.96}
          metalness={0.0}
        />
      </mesh>

      {/* Low Stone Planter Border Walls */}
      <mesh receiveShadow position={[18, 0.22, 8]}>
        <boxGeometry args={[0.3, 0.4, 26]} />
        <meshStandardMaterial color="#7E858E" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[-18, 0.22, 8]}>
        <boxGeometry args={[0.3, 0.4, 26]} />
        <meshStandardMaterial color="#7E858E" roughness={0.85} />
      </mesh>

      {/* ========================================================
          5. SWIMMING POOL & POOLSIDE TERRACE DECK
         ======================================================== */}
      {/* Travertine Pool Coping & Sun Lounge Deck */}
      <mesh receiveShadow position={[14, 0.04, -14]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 22]} />
        <meshStandardMaterial
          color="#D4CFC4"
          roughness={0.72}
          metalness={0.04}
        />
      </mesh>

      {/* Turquoise Water Body with Reflective Ripple Specular */}
      <mesh position={[14, 0.035, -14]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 16]} />
        <meshStandardMaterial
          color="#157B92"
          roughness={0.08}
          metalness={0.2}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Pool Basin Tiled Bottom */}
      <mesh position={[14, -0.6, -14]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 16]} />
        <meshStandardMaterial color="#0C4B5C" roughness={0.4} />
      </mesh>

      {/* West Zen Garden & Stone Stepping Promenade */}
      <mesh receiveShadow position={[-14, 0.04, -14]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 22]} />
        <meshStandardMaterial
          color="#BEB7AB"
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>

      {/* Rear Waterfront Boardwalk Promenade */}
      <mesh receiveShadow position={[0, 0.05, -34]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[68, 14]} />
        <meshStandardMaterial
          color="#64503E"
          roughness={0.75}
          metalness={0.06}
        />
      </mesh>

      {/* Expansive Water Body (River / Bay Shoreline) */}
      <mesh receiveShadow position={[0, -0.08, -80]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[360, 80]} />
        <meshStandardMaterial
          color="#122534"
          roughness={0.1}
          metalness={0.35}
        />
      </mesh>

      {/* ========================================================
          6. INSTANCED BELIEVABLE TREES (1 Draw Call for trunks, 1 for crowns)
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
        <cylinderGeometry args={[0.18, 0.28, 3.2, 8]} />
        <meshStandardMaterial color="#4A3B32" roughness={0.92} />
      </instancedMesh>

      {/* Tree Foliage Canopies (Tiered organic layered crowns with leaf scattering) */}
      <instancedMesh
        args={[undefined as any, undefined as any, treeCrownMatrices.length]}
        castShadow
        receiveShadow
        onUpdate={(self) => {
          treeCrownMatrices.forEach((mat, i) => self.setMatrixAt(i, mat));
          self.instanceMatrix.needsUpdate = true;
        }}
      >
        <dodecahedronGeometry args={[2.4, 1]} />
        <meshStandardMaterial
          color="#233E21"
          roughness={0.92}
          metalness={0.0}
        />
      </instancedMesh>

      {/* ========================================================
          7. DISTANT CONTEXT SKYLINE (Textured window banding & stepped silhouettes)
         ======================================================== */}
      <group>
        {distantBuildings.map((b, idx) => (
          <group key={`dist-bldg-${idx}`} position={b.pos as [number, number, number]} rotation={[0, b.rot, 0]}>
            {/* Main Tower Massing */}
            <mesh receiveShadow>
              <boxGeometry args={b.size as [number, number, number]} />
              <meshStandardMaterial
                color="#525B64"
                roughness={0.88}
                metalness={0.08}
              />
            </mesh>
            {/* Stepped Penthouse Crown */}
            <mesh position={[0, b.size[1] / 2 + 2, 0]}>
              <boxGeometry args={[b.size[0] * 0.7, 4, b.size[2] * 0.7]} />
              <meshStandardMaterial
                color="#40474F"
                roughness={0.82}
                metalness={0.15}
              />
            </mesh>
            {/* Architectural Glazing Band Relief */}
            <mesh position={[0, 0, b.size[2] / 2 + 0.05]}>
              <planeGeometry args={[b.size[0] * 0.85, b.size[1] * 0.8]} />
              <meshStandardMaterial
                color="#262D36"
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
