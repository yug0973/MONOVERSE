import React, { useEffect, useRef, useState } from 'react';
import { useGLTF, useTexture, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { RoomLabel3D } from './RoomLabel3D';
import { WALL_PALETTES } from '../../data/customizerPalettes';
import { getProceduralFloorTexture } from '../../lib/proceduralTextures';

const GLB_URL = '/models/Interior_asset_optimized.glb';
const PLASTER_NORMAL_URL = '/textures/pbr/plaster/Plaster001_1K-JPG_NormalGL.jpg';

/**
 * Senior Architectural Flat & Interior Walkthrough Rig
 * - Material audit: glass normalized (transmission 0, envMapIntensity 1.2, roughness 0.05, depthWrite false)
 * - Walls: subtle ambientCG plaster normal relief with dynamic palette response
 * - Floors: 2K procedural PBR textures (Banswara Marble, European Oak, Kund Slate, Chevron Herringbone)
 * - Ceilings: matte architectural ivory with 0ms cutaway toggle
 * - Contact shadows for grounded furniture & partition walls (zero fake dark blobs)
 */
export const DollhouseView: React.FC = () => {
  const {
    viewMode,
    selectedFlatId,
    customization,
    isLiteQuality,
  } = useAppStore();

  const [ripplePos, setRipplePos] = useState<[number, number, number] | null>(null);
  const [rippleTime, setRippleTime] = useState<number>(0);

  const { scene } = useGLTF(GLB_URL);
  const plasterNormal = useTexture(PLASTER_NORMAL_URL);

  useEffect(() => {
    if (plasterNormal) {
      plasterNormal.wrapS = THREE.RepeatWrapping;
      plasterNormal.wrapT = THREE.RepeatWrapping;
      plasterNormal.repeat.set(6, 6);
      plasterNormal.needsUpdate = true;
    }
  }, [plasterNormal]);

  const isFlatView =
    viewMode === 'dollhouse' ||
    viewMode === 'walkthrough' ||
    viewMode === 'foyer_entry';
  const isNight = customization.timeOfDay === 'night';
  const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;

  const activePalette = WALL_PALETTES.find((p) => p.id === customization.globalWallColor);
  const activeWallColorHex = activePalette?.hex || '#F5F2EB';
  const flooring = customization.flooring;
  const furniturePkg = customization.furniturePackage;

  // Cached node groups for zero-latency customizer updates
  const wallMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const floorMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const decorativeMeshesRef = useRef<THREE.Object3D[]>([]);
  const essentialMeshesRef = useRef<THREE.Object3D[]>([]);
  const ceilingMeshesRef = useRef<THREE.Object3D[]>([]);
  const isInitializedRef = useRef<boolean>(false);

  // Initial one-time scene setup, materials audit & classification of meshes
  useEffect(() => {
    if (!scene) return;

    const walls: THREE.MeshStandardMaterial[] = [];
    const floors: THREE.MeshStandardMaterial[] = [];
    const decor: THREE.Object3D[] = [];
    const essential: THREE.Object3D[] = [];
    const ceilings: THREE.Object3D[] = [];

    scene.traverse((child: any) => {
      // Freeze static matrices for instant frame dispatch
      child.matrixAutoUpdate = false;
      child.updateMatrix();

      if (child.isMesh) {
        const name = (child.name || '').toLowerCase();

        // Upgrade any flat unshaded MeshBasicMaterial to MeshStandardMaterial with physical PBR lighting
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((m: any) => {
              if (m.type === 'MeshBasicMaterial') {
                return new THREE.MeshStandardMaterial({
                  color: m.color,
                  map: m.map,
                  roughness: 0.65,
                  metalness: 0.04,
                  side: THREE.DoubleSide,
                });
              }
              return m;
            });
          } else if (child.material.type === 'MeshBasicMaterial') {
            const oldMat = child.material as THREE.MeshBasicMaterial;
            child.material = new THREE.MeshStandardMaterial({
              color: oldMat.color,
              map: oldMat.map,
              roughness: 0.65,
              metalness: 0.04,
              side: THREE.DoubleSide,
            });
          }
        }

        const mat = child.material as THREE.MeshStandardMaterial;
        const matName = (mat?.name || '').toLowerCase();

        // Optimized selective shadow casting:
        // Only structural walls, slabs, doors, beds, wardrobes, and major sofas cast shadows.
        // Small tabletop props, accessories, foliage, tableware, and nightstands do not cast shadows.
        const isShadowCaster =
          name.includes('wall') ||
          name.includes('floor') ||
          name.includes('slab') ||
          name.includes('column') ||
          name.includes('door') ||
          name.includes('sofa') ||
          name.includes('bed') ||
          name.includes('dining table') ||
          name.includes('island') ||
          name.includes('wardrobe') ||
          name.includes('cabinet');

        const isExcludedFromShadow =
          !isShadowCaster ||
          name.includes('drink table') ||
          name.includes('side table') ||
          name.includes('nightstand') ||
          name.includes('chair') ||
          name.includes('branch') ||
          name.includes('vase') ||
          name.includes('decor') ||
          name.includes('bottle') ||
          name.includes('cutting board') ||
          name.includes('canister') ||
          name.includes('fern') ||
          name.includes('palm') ||
          name.includes('plant') ||
          name.includes('glass') ||
          name.includes('curtain') ||
          name.includes('daybed') ||
          name.includes('pendant') ||
          name.includes('chandelier') ||
          matName.includes('glass');

        child.castShadow = !isExcludedFromShadow;
        child.receiveShadow = true;

        if (mat) {
          mat.side = THREE.DoubleSide;
          const physMat = mat as any;

          // 1. Glass Material Normalization (Transmission OFF, envMapIntensity 1.2)
          if (
            name.includes('glass') ||
            matName.includes('glass') ||
            matName.includes('glazing') ||
            name.includes('balustrade') ||
            name.includes('mirror')
          ) {
            physMat.transmission = 0;
            mat.transparent = true;
            mat.opacity = name.includes('mirror') ? 0.95 : 0.35;
            mat.roughness = name.includes('mirror') ? 0.02 : 0.05;
            mat.metalness = name.includes('mirror') ? 0.95 : 0.1;
            mat.envMapIntensity = 1.2;
            mat.depthWrite = false;
            child.renderOrder = 10;
          }
          // 2. Wall Plaster Materials
          else if (
            (matName.includes('warm ivory plaster') || matName.includes('plaster')) &&
            !matName.includes('cutaway') &&
            !matName.includes('ceiling')
          ) {
            mat.roughness = 0.88;
            mat.metalness = 0.02;
            mat.envMapIntensity = 0.6;
            if (plasterNormal) {
              mat.normalMap = plasterNormal;
              mat.normalScale = new THREE.Vector2(0.18, 0.18);
            }
            walls.push(mat);
          }
          // 3. Flooring Materials
          else if (
            matName.includes('travertine') ||
            matName.includes('floor') ||
            name.includes('floor')
          ) {
            floors.push(mat);
          }
          // 4. Luxury Architectural Furniture & Millwork PBR Upgrades
          else if (
            name.includes('chair') ||
            name.includes('sofa') ||
            name.includes('cushion') ||
            name.includes('upholstered') ||
            matName.includes('drapes') ||
            matName.includes('curtain')
          ) {
            // Tactile bouclé / oatmeal linen with soft sheen
            mat.roughness = 0.86;
            mat.metalness = 0.01;
            mat.envMapIntensity = 0.55;
            if (mat.color && (mat.color.getHex() === 0xffffff || mat.color.getHex() === 0xbcbcbc)) {
              mat.color.set('#EDE8DF');
            }
          }
          else if (
            name.includes('table') ||
            name.includes('wardrobe') ||
            name.includes('cabinet') ||
            name.includes('credenza') ||
            name.includes('desk') ||
            name.includes('wood') ||
            matName.includes('walnut') ||
            matName.includes('oak')
          ) {
            // Warm smoked European walnut / fluted millwork
            mat.roughness = 0.38;
            mat.metalness = 0.02;
            mat.envMapIntensity = 0.95;
            if (mat.color && mat.color.getHex() === 0xbcbcbc) {
              mat.color.set('#3A2F25');
            }
          }
          else if (
            name.includes('counter') ||
            name.includes('island') ||
            matName.includes('marble')
          ) {
            // Honed Statuario / Roman Travertine marble
            mat.roughness = 0.16;
            mat.metalness = 0.06;
            mat.envMapIntensity = 1.35;
          }
          else if (
            name.includes('frame') ||
            name.includes('bronze') ||
            name.includes('metal') ||
            name.includes('fitting') ||
            name.includes('bezel') ||
            matName.includes('bronze')
          ) {
            // Brushed architectural champagne bronze
            mat.roughness = 0.28;
            mat.metalness = 0.82;
            mat.envMapIntensity = 1.45;
            if (mat.color && (mat.color.getHex() === 0xffffff || mat.color.getHex() === 0xbcbcbc)) {
              mat.color.set('#8B7355');
            }
          }
          else if (
            name.includes('plant') ||
            name.includes('leaf') ||
            name.includes('bark') ||
            name.includes('pot') ||
            name.includes('vase') ||
            matName.includes('ceramic')
          ) {
            // Matte ceramic / lush architectural greenery
            mat.roughness = 0.42;
            mat.metalness = 0.02;
            mat.envMapIntensity = 0.65;
            if (mat.color && mat.color.getHex() === 0xbcbcbc) {
              mat.color.set(name.includes('leaf') || name.includes('plant') ? '#2D452B' : '#E2DDD5');
            }
          }
          else {
            // Fix generic chalky 1.0/1.0 metalness fallback
            if (mat.roughness >= 0.95 && mat.metalness >= 0.95) {
              mat.roughness = 0.65;
              mat.metalness = 0.04;
              mat.envMapIntensity = 0.75;
            }
          }
        }
      }

      if (child.name) {
        const name = child.name.toLowerCase();

        if (
          name.includes('ceiling') ||
          name.includes('fascia') ||
          name.includes('roof') ||
          name.includes('complete')
        ) {
          ceilings.push(child);
        } else if (
          name.includes('vase') ||
          name.includes('plant') ||
          name.includes('tree') ||
          name.includes('decor') ||
          name.includes('books') ||
          name.includes('candle') ||
          name.includes('centerpiece') ||
          name.includes('sculpture') ||
          name.includes('chandelier') ||
          name.includes('rug') ||
          name.includes('tray') ||
          name.includes('branch') ||
          name.includes('bottle') ||
          name.includes('cutting board') ||
          name.includes('canister') ||
          name.includes('fern') ||
          name.includes('pot_big') ||
          name.includes('pedestal') ||
          name.includes('hydrangea') ||
          name.includes('tableware') ||
          name.includes('accessories')
        ) {
          decor.push(child);
        } else if (
          name.includes('sofa') ||
          name.includes('dining table') ||
          name.includes('dining chair') ||
          name.includes('bed') ||
          name.includes('coffee table') ||
          name.includes('nightstand') ||
          name.includes('armchair') ||
          name.includes('daybed') ||
          name.includes('side table') ||
          name.includes('wardrobe')
        ) {
          essential.push(child);
        }
      }
    });

    wallMaterialsRef.current = walls;
    floorMaterialsRef.current = floors;
    decorativeMeshesRef.current = decor;
    essentialMeshesRef.current = essential;
    ceilingMeshesRef.current = ceilings;
    isInitializedRef.current = true;
  }, [scene, plasterNormal]);

  // Instant wall color update (0ms latency, no scene traversal)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const color = new THREE.Color(activeWallColorHex);
    for (const mat of wallMaterialsRef.current) {
      mat.color = color;
    }
  }, [activeWallColorHex]);

  // Instant flooring update with procedural PBR textures (0ms latency)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const floorTexture = getProceduralFloorTexture(flooring);

    for (const mat of floorMaterialsRef.current) {
      mat.map = floorTexture;
      mat.color.set('#FFFFFF');
      if (flooring === 'light_marble') {
        mat.roughness = 0.15;
        mat.metalness = 0.12;
        mat.envMapIntensity = 1.25;
      } else if (flooring === 'warm_oak') {
        mat.roughness = 0.42;
        mat.metalness = 0.04;
        mat.envMapIntensity = 0.8;
      } else if (flooring === 'herringbone') {
        mat.roughness = 0.38;
        mat.metalness = 0.05;
        mat.envMapIntensity = 0.85;
      } else if (flooring === 'dark_slate') {
        mat.roughness = 0.65;
        mat.metalness = 0.08;
        mat.envMapIntensity = 0.55;
      }
      mat.needsUpdate = true;
    }
  }, [flooring]);

  // Instant ceiling visibility toggle based on viewMode
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const hideCeilings = viewMode === 'dollhouse';
    for (const node of ceilingMeshesRef.current) {
      node.visible = !hideCeilings;
    }
  }, [viewMode]);

  // Instant furniture package swap
  useEffect(() => {
    if (!isInitializedRef.current) return;
    const showDecor = furniturePkg === 'premium';
    const showEssential = furniturePkg === 'essential' || furniturePkg === 'premium';

    for (const node of decorativeMeshesRef.current) {
      node.visible = showDecor;
    }
    for (const node of essentialMeshesRef.current) {
      node.visible = showEssential;
    }
  }, [furniturePkg]);

  // Early exit only after all hooks are called
  if (!isFlatView || !flat) return null;

  return (
    <group position={[0, 0, 0]}>
      {/* Real Interior Asset GLB Model */}
      <primitive object={scene} />

      {/* Real Ground Contact Shadow for Flat Base (replaces fake dark blobs) */}
      {!isLiteQuality && viewMode === 'dollhouse' && (
        <ContactShadows
          position={[0, -0.02, -6.0]}
          opacity={0.65}
          scale={34}
          blur={1.6}
          far={8}
          resolution={1024}
          frames={1}
          color="#0B111A"
        />
      )}

      {/* Photorealistic Interior Architectural Lighting Rig */}
      {(viewMode === 'walkthrough' || viewMode === 'foyer_entry') && (
        <group>
          {/* Ambient Fill tailored to Gujarat time-of-day solar state */}
          <ambientLight
            intensity={
              isNight ? 0.38 : customization.timeOfDay === 'golden_hour' ? 0.54 : 0.68
            }
            color={
              isNight
                ? '#CCD8E8'
                : customization.timeOfDay === 'golden_hour'
                ? '#FEEAD2'
                : '#F4F7FB'
            }
          />

          {/* Directional Exterior Sunlight / Moonlight Ingress through floor-to-ceiling glass */}
          {customization.timeOfDay === 'morning' && (
            <directionalLight
              position={[16, 8, -15]}
              color="#FFF0D4"
              intensity={1.85}
              target-position={[6, 1, -10]}
            />
          )}
          {customization.timeOfDay === 'golden_hour' && (
            <directionalLight
              position={[-18, 5, -14]}
              color="#FFA048"
              intensity={2.3}
              target-position={[-4, 1, -10]}
            />
          )}
          {isNight && (
            <directionalLight
              position={[-14, 12, -18]}
              color="#5A7BAE"
              intensity={0.65}
              target-position={[0, 1, -10]}
            />
          )}

          {/* Foyer & Entrance Gallery Ceiling Spot */}
          <pointLight
            position={[0.0, 2.7, -3.5]}
            color={isNight ? '#FFD494' : customization.timeOfDay === 'golden_hour' ? '#FFE4B5' : '#FFF6EB'}
            intensity={isNight ? 2.0 : 1.4}
            distance={14}
            decay={2}
          />

          {/* Living & Dining Hall Downlights */}
          <pointLight
            position={[7.44, 2.7, -9.5]}
            color={isNight ? '#FFD18A' : customization.timeOfDay === 'golden_hour' ? '#FFE5B8' : '#FFF8EE'}
            intensity={isNight ? 2.6 : customization.timeOfDay === 'golden_hour' ? 2.0 : 1.5}
            distance={22}
            decay={2}
          />

          {/* Kitchen Island Task Downlight */}
          <pointLight
            position={[7.5, 2.6, -3.5]}
            color={isNight ? '#FFDFA6' : '#FFF6EA'}
            intensity={isNight ? 2.2 : 1.6}
            distance={16}
            decay={2}
          />

          {/* Master Bedroom Suite Chandelier & Downlight */}
          <pointLight
            position={[-9.36, 2.6, -10.0]}
            color={isNight ? '#FFD18A' : customization.timeOfDay === 'golden_hour' ? '#FFE5B8' : '#FFF6EA'}
            intensity={isNight ? 2.4 : customization.timeOfDay === 'golden_hour' ? 1.8 : 1.4}
            distance={18}
            decay={2}
          />

          {/* Junior Suite Downlight */}
          <pointLight
            position={[-4.8, 2.5, -11.0]}
            color={isNight ? '#FFD89C' : '#FFF6EA'}
            intensity={isNight ? 2.0 : 1.3}
            distance={16}
            decay={2}
          />

          {/* Evening Accent Table Lamps & Bedside Sconces */}
          {(isNight || customization.timeOfDay === 'golden_hour') && (
            <group>
              {/* Master suite bedside table lamps */}
              <pointLight position={[-7.5, 1.1, -12.2]} color="#FFCA7A" intensity={1.5} distance={6} decay={2} />
              <pointLight position={[-11.2, 1.1, -12.2]} color="#FFCA7A" intensity={1.5} distance={6} decay={2} />
              {/* Living room credenza accent glow */}
              <pointLight position={[4.8, 1.15, -6.8]} color="#FFD18A" intensity={1.6} distance={8} decay={2} />
              {/* Family lounge reading light */}
              <pointLight position={[-0.2, 1.2, -12.5]} color="#FFD18A" intensity={1.5} distance={7} decay={2} />
            </group>
          )}
        </group>
      )}

      {/* Dollhouse Overview Overhead Fill */}
      {viewMode === 'dollhouse' && (
        <group>
          <ambientLight intensity={0.52} color="#FFF8F0" />
          <pointLight
            position={[7.15, 6.0, -6.74]}
            color={isNight ? '#FFE5B8' : '#FFF5E8'}
            intensity={isNight ? 2.4 : 1.6}
            distance={30}
            decay={2}
          />
          <pointLight
            position={[-7.01, 6.0, -6.93]}
            color={isNight ? '#FFE5B8' : '#FFF5E8'}
            intensity={isNight ? 2.2 : 1.4}
            distance={28}
            decay={2}
          />
        </group>
      )}

      {/* 3D Floating Room Badges in Dollhouse View */}
      {viewMode === 'dollhouse' &&
        flat.rooms.map((room) => (
          <RoomLabel3D key={`label-${room.id}`} room={room} />
        ))}

      {/* Real Enclosed Ceilings & Recessed Downlights (Walkthrough Only - Zero Cutaway Look) */}
      {(viewMode === 'walkthrough' || viewMode === 'foyer_entry') && (
        <group position={[0, 3.25, 0]}>
          {/* Foyer & Entrance Gallery Solid Finished Ceiling */}
          <mesh position={[0, 0, -4.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[7.4, 7.8]} />
            <meshStandardMaterial color="#F5F2EB" roughness={0.92} metalness={0.02} side={THREE.DoubleSide} />
          </mesh>

          {/* Double-Height Living & Dining Finished Ceiling */}
          <mesh position={[7.5, 0, -10.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[9.5, 8.2]} />
            <meshStandardMaterial color="#F5F2EB" roughness={0.92} metalness={0.02} side={THREE.DoubleSide} />
          </mesh>

          {/* Island Kitchen Finished Ceiling */}
          <mesh position={[7.8, 0, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8.8, 6.2]} />
            <meshStandardMaterial color="#F5F2EB" roughness={0.92} metalness={0.02} side={THREE.DoubleSide} />
          </mesh>

          {/* Presidential Master Suite Finished Ceiling */}
          <mesh position={[-9.4, 0, -10.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[5.8, 8.0]} />
            <meshStandardMaterial color="#F5F2EB" roughness={0.92} metalness={0.02} side={THREE.DoubleSide} />
          </mesh>

          {/* Family Lounge & Junior Suite Finished Ceiling */}
          <mesh position={[-2.4, 0, -10.2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8.6, 8.0]} />
            <meshStandardMaterial color="#F5F2EB" roughness={0.92} metalness={0.02} side={THREE.DoubleSide} />
          </mesh>

          {/* Recessed Architectural Downlight Apertures */}
          <group position={[0, -0.015, 0]}>
            <mesh position={[0, 0, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.08, 16]} />
              <meshBasicMaterial color={isNight ? '#FFD494' : '#FFF9F0'} />
            </mesh>
            <mesh position={[5.5, 0, -8.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.09, 16]} />
              <meshBasicMaterial color={isNight ? '#FFD494' : '#FFF9F0'} />
            </mesh>
            <mesh position={[9.2, 0, -8.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.09, 16]} />
              <meshBasicMaterial color={isNight ? '#FFD494' : '#FFF9F0'} />
            </mesh>
            <mesh position={[7.4, 0, -11.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.09, 16]} />
              <meshBasicMaterial color={isNight ? '#FFD494' : '#FFF9F0'} />
            </mesh>
            <mesh position={[7.5, 0, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.10, 16]} />
              <meshBasicMaterial color={isNight ? '#FFE0A8' : '#FFF9F0'} />
            </mesh>
            <mesh position={[-8.5, 0, -10.0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.08, 16]} />
              <meshBasicMaterial color={isNight ? '#FFD494' : '#FFF9F0'} />
            </mesh>
          </group>
        </group>
      )}

      {/* Clean Interactive Click-to-Walk Floor Plane (Zero 3D text billboards) */}
      {viewMode === 'walkthrough' && (
        <group>
          <mesh
            position={[0, 0.015, -8.8]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              const p = e.point;
              // Smooth boundary clamp within walkable apartment floor
              const targetX = Math.max(-11.8, Math.min(11.8, p.x));
              const targetZ = Math.max(-17.0, Math.min(-0.4, p.z));
              useAppStore.setState({
                activeHotspot: [targetX, 1.60, targetZ],
              });
              setRipplePos([targetX, 0.025, targetZ]);
              setRippleTime(Date.now());
            }}
          >
            <planeGeometry args={[26, 18]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>

          {/* Subtle ground-level walking ring feedback (fades out in 0.6s) */}
          {ripplePos && Date.now() - rippleTime < 600 && (
            <mesh position={ripplePos} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.22, 0.28, 32]} />
              <meshBasicMaterial color="#BA5D38" transparent opacity={0.65} />
            </mesh>
          )}
        </group>
      )}
    </group>
  );
};

// Preload only when user navigates to interior views
// useGLTF.preload(GLB_URL);
// useTexture.preload(PLASTER_NORMAL_URL);
