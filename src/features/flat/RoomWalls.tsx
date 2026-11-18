import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FlatData } from '../../types/building';
import { WALL_PALETTES } from '../../data/customizerPalettes';
import { getProceduralFloorTexture } from '../../lib/proceduralTextures';

interface RoomWallsProps {
  flat: FlatData;
}

export const RoomWalls: React.FC<RoomWallsProps> = ({ flat }) => {
  const {
    customization,
    baselineCustomization,
    isComparingOriginal,
  } = useAppStore();

  // If comparing original, render the baseline configuration
  const activeCustom = isComparingOriginal ? baselineCustomization : customization;

  // Global wall palette
  const globalPalette =
    WALL_PALETTES.find((p) => p.id === activeCustom.globalWallColor) || WALL_PALETTES[0];

  // Helper to resolve wall color for a specific room
  const getRoomPalette = (roomId: string) => {
    if (activeCustom.wallMode === 'per_room' && activeCustom.roomWallColors[roomId]) {
      const p = WALL_PALETTES.find((item) => item.id === activeCustom.roomWallColors[roomId]);
      if (p) return p;
    }
    return globalPalette;
  };

  const livingPalette = getRoomPalette('living_dining');
  const masterPalette = getRoomPalette('master_bedroom');
  const bed2Palette = getRoomPalette('bedroom_2');
  const kitchenPalette = getRoomPalette('kitchen');

  // Procedural flooring texture
  const floorTexture = getProceduralFloorTexture(activeCustom.flooring);

  return (
    <group>
      {/* 1. PROCEDURAL STRUCTURAL FLOOR SLAB */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[13.6, 0.12, 11.6]} />
        <meshStandardMaterial
          map={floorTexture}
          roughness={0.35}
          metalness={0.05}
        />
      </mesh>

      {/* Concrete Sub-Slab Reveal */}
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[13.8, 0.08, 11.8]} />
        <meshStandardMaterial color="#2d3035" roughness={0.9} />
      </mesh>

      {/* 2. RECESSED BASEBOARD SKIRTING (Dark Smoked Oak) */}
      <group position={[0, 0.05, 0]}>
        {/* North Wall Skirting */}
        <mesh position={[0, 0, -5.58]} receiveShadow>
          <boxGeometry args={[13.4, 0.1, 0.03]} />
          <meshStandardMaterial color="#221e1a" roughness={0.6} />
        </mesh>
        {/* East Wall Skirting */}
        <mesh position={[6.58, 0, 0]} receiveShadow>
          <boxGeometry args={[0.03, 0.1, 11.4]} />
          <meshStandardMaterial color="#221e1a" roughness={0.6} />
        </mesh>
        {/* West Wall Skirting */}
        <mesh position={[-6.58, 0, 0]} receiveShadow>
          <boxGeometry args={[0.03, 0.1, 11.4]} />
          <meshStandardMaterial color="#221e1a" roughness={0.6} />
        </mesh>
      </group>

      {/* 3. CUTAWAY ARCHITECTURAL PERIMETER WALLS (Height 2.8m) */}
      {/* North Wall (Solid feature wall) */}
      <mesh position={[0, 1.4, -5.7]} castShadow receiveShadow>
        <boxGeometry args={[13.6, 2.8, 0.22]} />
        <meshStandardMaterial
          color={livingPalette.hex}
          roughness={livingPalette.roughness}
        />
      </mesh>

      {/* South Wall with Floor-to-Ceiling Balcony Glazing */}
      <group position={[0, 1.4, 5.7]}>
        {/* Left Solid Wall Pier */}
        <mesh position={[-4.5, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 2.8, 0.22]} />
          <meshStandardMaterial
            color={livingPalette.hex}
            roughness={livingPalette.roughness}
          />
        </mesh>

        {/* Right Solid Wall Pier */}
        <mesh position={[4.5, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 2.8, 0.22]} />
          <meshStandardMaterial
            color={masterPalette.hex}
            roughness={masterPalette.roughness}
          />
        </mesh>

        {/* Balcony Portal Header Lintel */}
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.2, 0.22]} />
          <meshStandardMaterial color="#33373d" roughness={0.5} />
        </mesh>

        {/* Triple Sliding Glass Door Track Frame (Matte Black) */}
        <group position={[0, -0.05, 0]}>
          <mesh castShadow>
            <boxGeometry args={[4.38, 2.5, 0.06]} />
            <meshStandardMaterial color="#191b1d" roughness={0.4} metalness={0.7} wireframe={false} />
          </mesh>
          {/* Glass Door Panes */}
          <mesh position={[-0.7, 0, 0.02]}>
            <boxGeometry args={[1.42, 2.44, 0.015]} />
            <meshStandardMaterial
              color="#a3c4d4"
              roughness={0.08}
              metalness={0.3}
              transparent
              opacity={0.32}
            />
          </mesh>
          <mesh position={[0.7, 0, -0.02]}>
            <boxGeometry args={[1.42, 2.44, 0.015]} />
            <meshStandardMaterial
              color="#a3c4d4"
              roughness={0.08}
              metalness={0.3}
              transparent
              opacity={0.32}
            />
          </mesh>
          {/* Vertical Glass Door Handles (Brushed Brass) */}
          <mesh position={[-0.04, 0, 0.035]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.6, 12]} />
            <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
          </mesh>
        </group>
      </group>

      {/* East Exterior Wall with Master Suite Window Openings */}
      <group position={[6.7, 1.4, 0]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.22, 2.8, 11.6]} />
          <meshStandardMaterial
            color={masterPalette.hex}
            roughness={masterPalette.roughness}
          />
        </mesh>
      </group>

      {/* West Exterior Wall with Kitchen & Guest Bedroom Glazing */}
      <group position={[-6.7, 1.4, 0]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.22, 2.8, 11.6]} />
          <meshStandardMaterial
            color={kitchenPalette.hex}
            roughness={kitchenPalette.roughness}
          />
        </mesh>
      </group>

      {/* 4. INTERNAL PARTITION WALLS & ARCHITECTURAL CASING TRIM */}
      {/* Living Room to Master Bedroom Partition */}
      <group position={[2.2, 1.4, 0.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.18, 2.8, 5.8]} />
          <meshStandardMaterial
            color={masterPalette.hex}
            roughness={masterPalette.roughness}
          />
        </mesh>
        {/* Door Casing Trim / Architrave to Master Suite */}
        <group position={[-0.01, -0.3, 1.8]}>
          {/* Doorway Header */}
          <mesh position={[0, 1.05, 0]} castShadow>
            <boxGeometry args={[0.22, 0.08, 1.05]} />
            <meshStandardMaterial color="#2d2926" roughness={0.6} />
          </mesh>
          {/* Door Jambs */}
          <mesh position={[0, 0, -0.48]} castShadow>
            <boxGeometry args={[0.22, 2.1, 0.06]} />
            <meshStandardMaterial color="#2d2926" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.48]} castShadow>
            <boxGeometry args={[0.22, 2.1, 0.06]} />
            <meshStandardMaterial color="#2d2926" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* Master Bedroom to Bedroom 2 Partition */}
      <mesh position={[4.5, 1.4, -1.8]} castShadow receiveShadow>
        <boxGeometry args={[4.5, 2.8, 0.18]} />
        <meshStandardMaterial
          color={bed2Palette.hex}
          roughness={bed2Palette.roughness}
        />
      </mesh>

      {/* Living Room to Kitchen Partition */}
      <group position={[-2.4, 1.4, -2.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.18, 2.8, 4.8]} />
          <meshStandardMaterial
            color={kitchenPalette.hex}
            roughness={kitchenPalette.roughness}
          />
        </mesh>
        {/* Open Modern Cased Portal between Living & Kitchen */}
        <group position={[0, -0.2, 0.8]}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <boxGeometry args={[0.22, 0.08, 1.4]} />
            <meshStandardMaterial color="#2d2926" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, -0.66]} castShadow>
            <boxGeometry args={[0.22, 2.2, 0.06]} />
            <meshStandardMaterial color="#2d2926" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, 0.66]} castShadow>
            <boxGeometry args={[0.22, 2.2, 0.06]} />
            <meshStandardMaterial color="#2d2926" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* Internal Partition for 3 BHK Study / Bedroom 3 */}
      {flat.rooms.some((r) => r.id === 'bedroom_3') && (
        <mesh position={[-2.4, 1.4, 3.2]} castShadow receiveShadow>
          <boxGeometry args={[0.18, 2.8, 4.2]} />
          <meshStandardMaterial
            color={getRoomPalette('bedroom_3').hex}
            roughness={getRoomPalette('bedroom_3').roughness}
          />
        </mesh>
      )}

      {/* 5. ARCHITECTURAL PERIMETER FALSE CEILING COVE & RECESSED DOWNLIGHTS */}
      {/* Perimeter false ceiling soffit (leaves center open for dollhouse visibility, while giving true realism inside) */}
      <group position={[0, 2.72, 0]}>
        {/* North Cove Edge */}
        <mesh position={[0, 0, -5.2]} receiveShadow>
          <boxGeometry args={[13.2, 0.14, 0.8]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.9} />
        </mesh>
        {/* South Cove Edge */}
        <mesh position={[0, 0, 5.2]} receiveShadow>
          <boxGeometry args={[13.2, 0.14, 0.8]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.9} />
        </mesh>
        {/* East Cove Edge */}
        <mesh position={[6.2, 0, 0]} receiveShadow>
          <boxGeometry args={[0.8, 0.14, 11.2]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.9} />
        </mesh>
        {/* West Cove Edge */}
        <mesh position={[-6.2, 0, 0]} receiveShadow>
          <boxGeometry args={[0.8, 0.14, 11.2]} />
          <meshStandardMaterial color="#f7f6f2" roughness={0.9} />
        </mesh>

        {/* Warm Perimeter LED Cove Lighting Strip */}
        <mesh position={[0, -0.05, -4.82]}>
          <boxGeometry args={[12.8, 0.02, 0.04]} />
          <meshBasicMaterial color="#fff3db" />
        </mesh>
        <mesh position={[0, -0.05, 4.82]}>
          <boxGeometry args={[12.8, 0.02, 0.04]} />
          <meshBasicMaterial color="#fff3db" />
        </mesh>
        <mesh position={[5.82, -0.05, 0]}>
          <boxGeometry args={[0.04, 0.02, 10.8]} />
          <meshBasicMaterial color="#fff3db" />
        </mesh>
        <mesh position={[-5.82, -0.05, 0]}>
          <boxGeometry args={[0.04, 0.02, 10.8]} />
          <meshBasicMaterial color="#fff3db" />
        </mesh>

        {/* Ambient Warm Interior Downlights (Downlight Cans) */}
        {[-4, -1.5, 1.5, 4].map((x, i) => (
          <group key={i} position={[x, -0.06, 0]}>
            <mesh>
              <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
              <meshStandardMaterial color="#2d2926" roughness={0.3} metalness={0.7} />
            </mesh>
            <mesh position={[0, -0.01, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.005, 16]} />
              <meshBasicMaterial color="#fff7e6" />
            </mesh>
            <pointLight position={[0, -0.1, 0]} intensity={0.25} distance={3.5} color="#ffe8c2" />
          </group>
        ))}
      </group>
    </group>
  );
};
