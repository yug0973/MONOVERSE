import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';
import { FlatData } from '../../types/building';
import { Sofa } from './models/Sofa';
import { Bed } from './models/Bed';
import { DiningSet } from './models/DiningSet';
import { TvUnit } from './models/TvUnit';
import { Wardrobe } from './models/Wardrobe';
import { StudyDesk } from './models/StudyDesk';
import { Planters } from './models/Planters';
import { Rug } from './models/Rug';
import { Kitchen } from './models/Kitchen';

interface ProceduralFurnitureProps {
  flat: FlatData;
}

/** Luxury Framed Architectural Wall Art Canvas */
const WallArt: React.FC<{
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  theme?: 'terracotta' | 'monochrome' | 'sage';
}> = ({ position, rotation = [0, 0, 0], width = 1.2, height = 1.5, theme = 'terracotta' }) => {
  const artColor = theme === 'terracotta' ? '#BA5D38' : theme === 'sage' ? '#5E6D5F' : '#2D3139';
  const accentColor = theme === 'terracotta' ? '#D68C45' : theme === 'sage' ? '#92A093' : '#6A707E';

  return (
    <group position={position} rotation={rotation}>
      {/* Outer Anodized Dark Bronze Shadow-Box Frame */}
      <mesh castShadow>
        <boxGeometry args={[width + 0.08, height + 0.08, 0.04]} />
        <meshStandardMaterial color="#1a1816" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Off-White Archival Matting */}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[width, height, 0.01]} />
        <meshStandardMaterial color="#F7F5F0" roughness={0.9} />
      </mesh>

      {/* Abstract Architectural Geometric Canvas Art */}
      <mesh position={[0, 0, 0.022]}>
        <boxGeometry args={[width * 0.78, height * 0.78, 0.005]} />
        <meshStandardMaterial color="#EAE5DC" roughness={0.95} />
      </mesh>

      {/* Geometric Graphic Insets */}
      <mesh position={[-width * 0.12, height * 0.08, 0.026]}>
        <circleGeometry args={[width * 0.22, 32]} />
        <meshStandardMaterial color={artColor} roughness={0.8} />
      </mesh>
      <mesh position={[width * 0.14, -height * 0.12, 0.028]}>
        <planeGeometry args={[width * 0.32, height * 0.36]} />
        <meshStandardMaterial color={accentColor} roughness={0.85} />
      </mesh>
    </group>
  );
};

export const ProceduralFurniture: React.FC<ProceduralFurnitureProps> = ({ flat }) => {
  const { customization, prefersReducedMotion } = useAppStore();
  const pkg = customization.furniturePackage;

  const groupRef = useRef<THREE.Group>(null);
  const targetScaleY = useRef<number>(pkg === 'empty' ? 0.001 : 1);
  const currentScaleY = useRef<number>(pkg === 'empty' ? 0.001 : 1);

  targetScaleY.current = pkg === 'empty' ? 0.001 : 1;

  // Smooth rise animation when switching packages
  useFrame((_, delta) => {
    if (groupRef.current) {
      const step = prefersReducedMotion ? 1.0 : Math.min(delta * 4.5, 0.2);
      currentScaleY.current = THREE.MathUtils.lerp(
        currentScaleY.current,
        targetScaleY.current,
        step
      );
      groupRef.current.scale.set(1, currentScaleY.current, 1);
      groupRef.current.visible = currentScaleY.current > 0.01;
    }
  });

  if (pkg === 'empty') return null;

  const hasEssential = pkg === 'essential' || pkg === 'premium';
  const hasPremium = pkg === 'premium';

  // Room coordinates from flat config
  const livingRoom = flat.rooms.find((r) => r.id === 'living_dining');
  const kitchenRoom = flat.rooms.find((r) => r.id === 'kitchen');
  const masterRoom = flat.rooms.find((r) => r.id === 'master_bedroom');
  const bedroom2 = flat.rooms.find((r) => r.id === 'bedroom_2');
  const bedroom3 = flat.rooms.find((r) => r.id === 'bedroom_3');
  const balcony = flat.rooms.find((r) => r.id === 'balcony');
  const foyer = flat.rooms.find((r) => r.id === 'foyer');

  return (
    <group ref={groupRef}>
      {/* 1. GRAND LIVING & DINING ROOM */}
      {hasEssential && livingRoom && (
        <group position={livingRoom.position}>
          {/* Living Lounge Zone */}
          <group position={[0, 0, 1.2]}>
            <Rug position={[0, 0, 0]} size={[3.8, 2.6]} color="#e3ddd4" />
            <Sofa position={[0, 0, 0.4]} rotation={[0, 0, 0]} includeLivingSet={hasPremium} />
            <TvUnit position={[0, 0, -1.2]} rotation={[0, 0, 0]} />
          </group>

          {/* Dining Banquet Zone */}
          <group position={[0, 0, -1.8]}>
            <DiningSet position={[0, 0, 0]} />
          </group>

          {/* Statement Indoor Planters */}
          <Planters position={[-2.1, 0, 1.9]} potColor="#363940" />

          {/* Curated Gallery Art Canvas on Main Living Wall */}
          <WallArt
            position={[-livingRoom.dimensionsMeters.width / 2 + 0.1, 1.65, 0.4]}
            rotation={[0, Math.PI / 2, 0]}
            width={1.6}
            height={1.3}
            theme="terracotta"
          />
        </group>
      )}

      {/* 2. GOURMET MODULAR CHEF'S KITCHEN */}
      {kitchenRoom && (
        <group position={kitchenRoom.position}>
          <Kitchen position={[0, 0, 0]} isPremium={hasPremium} />
        </group>
      )}

      {/* 3. MASTER BEDROOM SUITE */}
      {hasEssential && masterRoom && (
        <group position={masterRoom.position}>
          <Rug position={[0, 0, 0.2]} size={[3.0, 2.8]} color="#ece6dd" />
          <Bed position={[0, 0, 0.1]} rotation={[0, Math.PI, 0]} />
          {hasPremium && (
            <Wardrobe
              position={[-masterRoom.dimensionsMeters.width / 2 + 0.4, 0, -0.6]}
              rotation={[0, Math.PI / 2, 0]}
            />
          )}
          {hasPremium && (
            <Planters
              position={[masterRoom.dimensionsMeters.width / 2 - 0.7, 0, 1.8]}
              potColor="#c88065"
            />
          )}
          {/* Master Bedroom Gallery Canvas */}
          <WallArt
            position={[masterRoom.dimensionsMeters.width / 2 - 0.08, 1.6, -0.2]}
            rotation={[0, -Math.PI / 2, 0]}
            width={1.2}
            height={1.4}
            theme="sage"
          />
        </group>
      )}

      {/* 4. BEDROOM 2 / GUEST BEDROOM */}
      {hasPremium && bedroom2 && (
        <group position={bedroom2.position}>
          <Rug position={[0, 0, 0]} size={[2.5, 2.4]} color="#e6e1d8" />
          <Bed position={[0, 0, 0]} rotation={[0, Math.PI, 0]} scale={0.92} />
          <Wardrobe
            position={[-bedroom2.dimensionsMeters.width / 2 + 0.4, 0, -0.5]}
            rotation={[0, Math.PI / 2, 0]}
            scale={0.9}
          />
          <WallArt
            position={[0, 1.6, bedroom2.dimensionsMeters.length / 2 - 0.08]}
            rotation={[0, Math.PI, 0]}
            width={1.1}
            height={1.1}
            theme="monochrome"
          />
        </group>
      )}

      {/* 5. BEDROOM 3 / HOME STUDY SUITE (3 BHK Units) */}
      {hasPremium && bedroom3 && (
        <group position={bedroom3.position}>
          <StudyDesk position={[0, 0, 0]} />
          <Planters position={[1.4, 0, 0.8]} potColor="#eae5dc" />
          <WallArt
            position={[0, 1.6, bedroom3.dimensionsMeters.length / 2 - 0.08]}
            rotation={[0, Math.PI, 0]}
            width={1.2}
            height={1.3}
            theme="terracotta"
          />
        </group>
      )}

      {/* 6. ENTRANCE FOYER CONSOLE & MIRROR (If flat has foyer) */}
      {foyer && (
        <group position={foyer.position}>
          {/* Foyer Floating Console Table */}
          <group position={[0, 0, -foyer.dimensionsMeters.length / 2 + 0.35]}>
            <RoundedBox args={[1.4, 0.08, 0.36]} position={[0, 0.85, 0]} radius={0.015} smoothness={4} castShadow>
              <meshStandardMaterial color="#2d2926" roughness={0.6} />
            </RoundedBox>
            {/* Brass Console Legs */}
            {[-0.6, 0.6].map((x, xi) => (
              <mesh key={xi} position={[x, 0.42, 0]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.84, 12]} />
                <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
              </mesh>
            ))}
            {/* Foyer Circular Framed Mirror with Backlight */}
            <group position={[0, 1.5, 0]}>
              <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.42, 0.42, 0.02, 36]} />
                <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
              </mesh>
              <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.4, 0.4, 0.005, 36]} />
                <meshStandardMaterial color="#ffffff" roughness={0.05} metalness={0.95} />
              </mesh>
              <pointLight position={[0, 0, 0.05]} intensity={0.3} distance={1.2} color="#ffe8c2" />
            </group>
          </group>
        </group>
      )}

      {/* 7. BALCONY SUNDECK OUTDOOR FURNITURE */}
      {balcony && (
        <group position={balcony.position}>
          {/* Luxury Teak Outdoor Armchairs & Bistro Drink Table */}
          <group position={[0, 0, 0]}>
            {/* Teak & Slender Iron Bistro Table */}
            <mesh position={[0, 0.28, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.56, 12]} />
              <meshStandardMaterial color="#1a1816" roughness={0.4} metalness={0.7} />
            </mesh>
            <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.03, 32]} />
              <meshStandardMaterial color="#8a5e38" roughness={0.5} />
            </mesh>

            {/* Balcony Loungers / Chairs */}
            {[-0.8, 0.8].map((x, xi) => (
              <group key={xi} position={[x, 0, 0]} rotation={[0, xi === 0 ? 0.35 : -0.35, 0]}>
                <RoundedBox args={[0.55, 0.06, 0.55]} position={[0, 0.38, 0]} radius={0.02} smoothness={4} castShadow>
                  <meshStandardMaterial color="#946b45" roughness={0.6} />
                </RoundedBox>
                <RoundedBox args={[0.5, 0.04, 0.5]} position={[0, 0.43, 0]} radius={0.02} smoothness={4}>
                  <meshStandardMaterial color="#f0ece5" roughness={0.9} />
                </RoundedBox>
                <RoundedBox args={[0.55, 0.45, 0.06]} position={[0, 0.62, -0.25]} rotation={[-0.15, 0, 0]} radius={0.02} smoothness={4} castShadow>
                  <meshStandardMaterial color="#946b45" roughness={0.6} />
                </RoundedBox>
              </group>
            ))}
          </group>

          {/* Lush Balcony Planters flanking corner */}
          <Planters
            position={[-balcony.dimensionsMeters.width / 2 + 0.6, 0, balcony.dimensionsMeters.length / 2 - 0.5]}
            potColor="#ba5d38"
            scale={0.95}
          />
          <Planters
            position={[balcony.dimensionsMeters.width / 2 - 0.6, 0, balcony.dimensionsMeters.length / 2 - 0.5]}
            potColor="#ba5d38"
            scale={0.95}
          />
        </group>
      )}
    </group>
  );
};
