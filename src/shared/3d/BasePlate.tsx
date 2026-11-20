import React, { useMemo } from 'react';
import * as THREE from 'three';
import { MeshReflectorMaterial } from '@react-three/drei';
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
 * Procedural Distant Skyline Window Grid Texture
 * Simulates high-rise evening lit windows glowing through atmospheric fog
 */
function createSkylineWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#101722';
  ctx.fillRect(0, 0, 256, 512);

  // Tiny illuminated residential windows in dusk skyline
  for (let y = 16; y < 496; y += 14) {
    for (let x = 12; x < 244; x += 18) {
      const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const isLit = (Math.abs(hash) % 1) > 0.42; // ~58% lit windows

      if (isLit) {
        const warmTone = (Math.abs(hash * 3.7) % 1);
        ctx.fillStyle = warmTone > 0.5 ? '#FFDCA0' : '#FFC478';
        ctx.fillRect(x, y, 10, 7);
      } else {
        ctx.fillStyle = '#182230';
        ctx.fillRect(x, y, 10, 7);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/**
 * Senior Architectural Landscaped Base Plate & Blue-Hour Dusk Context Rig
 * - Wet-look asphalt & paved plaza with MeshReflectorMaterial reflections (roughness 0.35)
 * - Expansive 480m ground apron seamlessly fading into horizon exponential fog (zero hard edges)
 * - Path bollard lights casting localized warm glows
 * - Distant ring of silhouette towers with illuminated evening window grids through atmospheric fog
 * - Instanced botanical alpha trees with warm dusk rim light and ground contact shadows
 */
export const BasePlate: React.FC = () => {
  const { viewMode, isLiteQuality } = useAppStore();

  const foliageAlphaTex = useMemo(() => createFoliageAlphaTexture(), []);
  const skylineWindowTex = useMemo(() => createSkylineWindowTexture(), []);

  // 1. Generate Instanced Tree Transforms in 3 Species (48 perimeter & garden trees)
  const { treeTrunkMatrices, treePlane1Matrices, treePlane2Matrices, treeShadowPositions } = useMemo(() => {
    const dummy = new THREE.Object3D();
    const trunkMats: THREE.Matrix4[] = [];
    const p1Mats: THREE.Matrix4[] = [];
    const p2Mats: THREE.Matrix4[] = [];
    const shadowPos: [number, number, number, number][] = [];

    const treePositions: [number, number, number, number][] = [
      // Entrance boulevard (East)
      [18, 0, 16, 1.1],
      [18, 0, 24, 0.95],
      [18, 0, 32, 1.15],
      [18, 0, 40, 1.0],
      [26, 0, 18, 1.2],
      [26, 0, 28, 1.05],
      [26, 0, 38, 1.1],

      // Entrance boulevard (West)
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

      // West Courtyard
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
      const species = idx % 3;
      const aspectX = species === 0 ? 0.85 : species === 1 ? 1.25 : 1.05;
      const aspectY = species === 0 ? 1.35 : species === 1 ? 1.05 : 1.0;

      // Trunk transform
      dummy.position.set(x, y + 1.8 * s * aspectY, z);
      dummy.scale.set(s, s * aspectY, s);
      dummy.rotation.set(0, (x + z) * 0.45, 0);
      dummy.updateMatrix();
      trunkMats.push(dummy.matrix.clone());

      // Crossed-Plane 1
      dummy.position.set(x, y + 4.2 * s * aspectY, z);
      dummy.scale.set(s * aspectX, s * aspectY, s * aspectX);
      dummy.rotation.set(0, (x * 0.1) % Math.PI, 0);
      dummy.updateMatrix();
      p1Mats.push(dummy.matrix.clone());

      // Crossed-Plane 2
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

  // 2. Distant Skyline Ring (24 towers placed in a perimeter ring at 210m-290m)
  const distantSkylineTowers = useMemo(() => {
    const towers = [];
    const count = 24;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      // Leave an open sky window towards the warm sunset horizon (angle ~ 3.6 to 4.2 rad)
      // so the sunset glow is framed dramatically without being blocked by a monolithic wall!
      const isSunsetWindow = angle > 3.60 && angle < 4.20;
      if (isSunsetWindow) {
        // Only a small low-rise skyline silhouette in this corridor so sky shines through
        const radius = 270;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        towers.push({
          pos: [x, 14, z] as [number, number, number],
          size: [14, 28, 12] as [number, number, number],
          rot: angle + 0.2,
        });
        continue;
      }

      const radius = 210 + ((i * 23) % 70);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const width = 16 + ((i * 7) % 12);
      const depth = 14 + ((i * 11) % 10);
      const height = 42 + ((i * 17) % 52); // 42m to 94m varied heights
      towers.push({
        pos: [x, height / 2, z] as [number, number, number],
        size: [width, height, depth] as [number, number, number],
        rot: angle + 0.3,
      });
    }
    return towers;
  }, []);

  // 3. Path Bollard Lights along Driveway and Walkways
  const bollardPositions: [number, number, number][] = useMemo(() => [
    [-17, 0, 16], [-17, 0, 24], [-17, 0, 32], [-17, 0, 40],
    [17, 0, 16], [17, 0, 24], [17, 0, 32], [17, 0, 40],
    [-10, 0, 8], [10, 0, 8],
    [-22, 0, -8], [-22, 0, -18],
    [22, 0, -8], [22, 0, -18],
  ], []);

  const foliagePlaneGeom = useMemo(() => {
    const geom = new THREE.PlaneGeometry(4.6, 5.4);
    geom.computeVertexNormals();
    return geom;
  }, []);

  if (viewMode === 'dollhouse' || viewMode === 'walkthrough') {
    return null;
  }

  return (
    <group position={[0, -0.01, 0]}>
      {/* ========================================================
          1. EXPANSIVE GROUND APRON (800m Seamless Horizon Fade into Fog)
         ======================================================== */}
      <mesh receiveShadow position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[800, 800, 32, 32]} />
        <meshStandardMaterial
          color="#0B1220" // Matches dusk horizon fog exactly: zero visible edge
          roughness={0.98}
          metalness={0.0}
        />
      </mesh>

      {/* ========================================================
          2. WET-LOOK REFLECTIVE PLAZA & ARRIVAL COURT (drei MeshReflectorMaterial)
         ======================================================== */}
      <mesh receiveShadow position={[0, 0.03, 18]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[52, 36]} />
        {!isLiteQuality ? (
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mixBlur={1.0}
            mixStrength={2.0}
            roughness={0.35} // Wet-look roughness per requirement 2
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#202630"
            metalness={0.15}
            mirror={0.52}
          />
        ) : (
          <meshStandardMaterial color="#202630" roughness={0.35} metalness={0.15} />
        )}
      </mesh>

      {/* Main Internal Asphalt Driveway with Wet Reflections */}
      <mesh receiveShadow position={[0, 0.02, 38]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[76, 20]} />
        {!isLiteQuality ? (
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mixBlur={0.9}
            mixStrength={1.8}
            roughness={0.38} // Wet asphalt
            depthScale={1.0}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#181D26"
            metalness={0.12}
            mirror={0.48}
          />
        ) : (
          <meshStandardMaterial color="#181D26" roughness={0.38} metalness={0.12} />
        )}
      </mesh>

      {/* Driveway Centerline Lane Marking */}
      <mesh position={[0, 0.025, 38]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[68, 0.22]} />
        <meshBasicMaterial color="#E0E6EE" opacity={0.75} transparent />
      </mesh>

      {/* Concrete Beveled Curbs */}
      <mesh receiveShadow position={[0, 0.08, 19.9]}>
        <boxGeometry args={[60, 0.14, 0.25]} />
        <meshStandardMaterial color="#4A525E" roughness={0.75} />
      </mesh>
      <mesh receiveShadow position={[0, 0.08, 36.1]}>
        <boxGeometry args={[60, 0.14, 0.25]} />
        <meshStandardMaterial color="#4A525E" roughness={0.75} />
      </mesh>

      {/* ========================================================
          3. LANDSCAPED LAWN STRIPS & BORDER WALLS
         ======================================================== */}
      {/* East Landscaped Lawn */}
      <mesh receiveShadow position={[29, 0.04, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 28]} />
        <meshStandardMaterial color="#1B2E1A" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* West Landscaped Lawn */}
      <mesh receiveShadow position={[-29, 0.04, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 28]} />
        <meshStandardMaterial color="#1B2E1A" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* Low Stone Planter Border Walls */}
      <mesh receiveShadow position={[19.8, 0.22, 10]}>
        <boxGeometry args={[0.35, 0.42, 28]} />
        <meshStandardMaterial color="#423D38" roughness={0.85} />
      </mesh>
      <mesh receiveShadow position={[-19.8, 0.22, 10]}>
        <boxGeometry args={[0.35, 0.42, 28]} />
        <meshStandardMaterial color="#423D38" roughness={0.85} />
      </mesh>

      {/* ========================================================
          4. RESORT POOL & DECK AT REAR
         ======================================================== */}
      <mesh receiveShadow position={[0, 0.04, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[36, 18]} />
        <meshStandardMaterial color="#4A505A" roughness={0.55} metalness={0.08} />
      </mesh>
      <mesh receiveShadow position={[0, 0.03, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 10]} />
        <meshStandardMaterial color="#0E7898" roughness={0.08} metalness={0.2} />
      </mesh>

      {/* ========================================================
          5. WARM ARCHITECTURAL PATH BOLLARD LIGHTS
         ======================================================== */}
      <group>
        {bollardPositions.map(([bx, by, bz], bIdx) => (
          <group key={`bollard-${bIdx}`} position={[bx, by, bz]}>
            {/* Bollard Post */}
            <mesh position={[0, 0.45, 0]}>
              <cylinderGeometry args={[0.07, 0.08, 0.9, 12]} />
              <meshStandardMaterial color="#22252A" roughness={0.4} metalness={0.85} />
            </mesh>
            {/* Warm Emissive Light Slit */}
            <mesh position={[0, 0.85, 0]}>
              <cylinderGeometry args={[0.072, 0.072, 0.08, 12]} />
              <meshStandardMaterial
                color="#FFE0A0"
                emissive="#FFE0A0"
                emissiveIntensity={3.2}
                roughness={0.2}
              />
            </mesh>
            {/* Soft Local Light Pool on Pavement */}
            <pointLight position={[0, 0.9, 0]} color="#FFD895" intensity={0.6} distance={4.5} decay={2} />
          </group>
        ))}
      </group>

      {/* ========================================================
          6. INSTANCED BOTANICAL ALPHA TREES WITH WARM DUSK RIM LIGHT
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
        <meshStandardMaterial color="#2E241E" roughness={0.92} />
      </instancedMesh>

      {/* Foliage Crossed-Plane 1 with Warm Dusk Rim Glow */}
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
          color="#1E341B"
          emissive="#2A2214" // Subtle warm dusk rim glow
          emissiveIntensity={0.25}
          roughness={0.82}
          metalness={0.0}
          alphaMap={foliageAlphaTex}
          transparent={true}
          alphaTest={0.4}
          depthWrite={true}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* Foliage Crossed-Plane 2 */}
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
          color="#182A16"
          emissive="#2A2214"
          emissiveIntensity={0.25}
          roughness={0.82}
          metalness={0.0}
          alphaMap={foliageAlphaTex}
          transparent={true}
          alphaTest={0.4}
          depthWrite={true}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* Ground Contact Shadow Discs */}
      <group>
        {treeShadowPositions.map(([sx, sy, sz, diam], sIdx) => (
          <mesh key={`tree-shadow-${sIdx}`} position={[sx, sy, sz]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[diam * 0.45, 16]} />
            <meshBasicMaterial
              color="#070D09"
              transparent
              opacity={0.55}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          7. DISTANT RING OF SILHOUETTE SKYLINE TOWERS WITH LIT WINDOWS
         ======================================================== */}
      <group>
        {distantSkylineTowers.map((b, idx) => (
          <group key={`skyline-tower-${idx}`} position={b.pos} rotation={[0, b.rot, 0]}>
            {/* Silhouette Tower Massing */}
            <mesh>
              <boxGeometry args={b.size} />
              <meshStandardMaterial
                color="#121A28" // Muted twilight silhouette
                roughness={0.88}
                metalness={0.08}
              />
            </mesh>

            {/* Stepped Penthouse Crown */}
            <mesh position={[0, b.size[1] / 2 + 2.5, 0]}>
              <boxGeometry args={[b.size[0] * 0.65, 5, b.size[2] * 0.65]} />
              <meshStandardMaterial color="#0F1622" roughness={0.82} metalness={0.12} />
            </mesh>

            {/* Evening Lit Window Grid Facades (All 4 Elevations) */}
            {/* South Facade */}
            <mesh position={[0, 0, b.size[2] / 2 + 0.05]}>
              <planeGeometry args={[b.size[0] * 0.88, b.size[1] * 0.85]} />
              <meshStandardMaterial
                map={skylineWindowTex}
                roughness={0.5}
                emissive="#FFC870"
                emissiveIntensity={0.70}
              />
            </mesh>
            {/* North Facade */}
            <mesh position={[0, 0, -b.size[2] / 2 - 0.05]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[b.size[0] * 0.88, b.size[1] * 0.85]} />
              <meshStandardMaterial
                map={skylineWindowTex}
                roughness={0.5}
                emissive="#FFC870"
                emissiveIntensity={0.70}
              />
            </mesh>
            {/* East Facade */}
            <mesh position={[b.size[0] / 2 + 0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[b.size[2] * 0.88, b.size[1] * 0.85]} />
              <meshStandardMaterial
                map={skylineWindowTex}
                roughness={0.5}
                emissive="#FFC870"
                emissiveIntensity={0.70}
              />
            </mesh>
            {/* West Facade */}
            <mesh position={[-b.size[0] / 2 - 0.05, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
              <planeGeometry args={[b.size[2] * 0.88, b.size[1] * 0.85]} />
              <meshStandardMaterial
                map={skylineWindowTex}
                roughness={0.5}
                emissive="#FFC870"
                emissiveIntensity={0.70}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
