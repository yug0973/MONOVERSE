import React from 'react';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { BUILDING_FLOORS } from '../../data/buildingData';
import { FlatData, FlatStatus } from '../../types/building';
import { Html } from '@react-three/drei';

interface FloorSliceViewProps {
  floorNumber: number;
}

export const FloorSliceView: React.FC<FloorSliceViewProps> = ({ floorNumber }) => {
  const {
    enterApartment3D,
    hoveredFlatId,
    setHoveredFlat,
  } = useAppStore();

  const floor = BUILDING_FLOORS.find((f) => f.floorNumber === floorNumber);
  if (!floor || floor.flats.length === 0) return null;

  // Exact G+14 residential tower elevation: Base podium is 6.0m, then 3.0m per floor
  const floorElevation = 6.0 + (floorNumber - 1) * 3.0;

  // 4 Quadrant placement for A, B, C, D with clear collision-free offsets
  const getQuadrantSpecs = (unit: string) => {
    switch (unit) {
      case 'A': // Front-Right (South-East)
        return {
          position: [6.4, floorElevation + 0.12, 5.2] as [number, number, number],
          size: [11.8, 9.2] as [number, number],
          labelOffset: [1.2, 0.5, 0.8] as [number, number, number],
        };
      case 'B': // Rear-Right (North-East)
        return {
          position: [6.4, floorElevation + 0.12, -5.2] as [number, number, number],
          size: [11.8, 9.2] as [number, number],
          labelOffset: [1.2, 0.5, -0.8] as [number, number, number],
        };
      case 'C': // Rear-Left (North-West)
        return {
          position: [-6.4, floorElevation + 0.12, -5.2] as [number, number, number],
          size: [11.8, 9.2] as [number, number],
          labelOffset: [-1.2, 0.5, -0.8] as [number, number, number],
        };
      case 'D': // Front-Left (South-West)
        return {
          position: [-6.4, floorElevation + 0.12, 5.2] as [number, number, number],
          size: [11.8, 9.2] as [number, number],
          labelOffset: [-1.2, 0.5, 0.8] as [number, number, number],
        };
      default:
        return {
          position: [0, floorElevation + 0.12, 0] as [number, number, number],
          size: [10, 10] as [number, number],
          labelOffset: [0, 0.5, 0] as [number, number, number],
        };
    }
  };

  const getStatusColor = (st: FlatStatus, isHovered: boolean) => {
    if (isHovered) return '#BA5D38'; // Terracotta accent on hover
    switch (st) {
      case 'AVAILABLE':
        return '#2E7D5A';
      case 'HELD':
        return '#B87B2E';
      case 'SOLD':
        return '#8A8F98';
    }
  };

  return (
    <group>
      {/* Structural Sliced Slab Top Surface */}
      <mesh position={[0, floorElevation + 0.08, 0]} receiveShadow>
        <boxGeometry args={[26.4, 0.15, 20.4]} />
        <meshStandardMaterial color="#EAE5DC" roughness={0.7} />
      </mesh>

      {/* Central Elevator & Stair Core */}
      <group position={[0, floorElevation + 0.16, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.2, 0.8, 5.8]} />
          <meshStandardMaterial color="#42464D" roughness={0.6} />
        </mesh>
        {/* Elevator Door Insets */}
        <mesh position={[0, 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.8, 5.4]} />
          <meshStandardMaterial color="#555B63" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* Sliced Cutaway Partition Walls on this floor */}
      <group position={[0, floorElevation + 0.45, 0]}>
        {/* Longitudinal Spine Wall */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[25.8, 0.7, 0.22]} />
          <meshStandardMaterial color="#35383F" roughness={0.7} />
        </mesh>
        {/* Transverse Cross Wall */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.22, 0.7, 19.8]} />
          <meshStandardMaterial color="#35383F" roughness={0.7} />
        </mesh>
      </group>

      {/* The 4 Flat Quadrants with Collision-Avoidance Labels */}
      {floor.flats.map((flat: FlatData) => {
        const specs = getQuadrantSpecs(flat.unitNumber);
        const isHovered = hoveredFlatId === flat.id;
        const isSold = flat.status === 'SOLD';
        const color = getStatusColor(flat.status, isHovered);

        return (
          <group key={flat.id} position={specs.position}>
            {/* Interactive Flat Sliced Floorplate */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                if (!isSold) enterApartment3D(flat.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredFlat(flat.id);
                document.body.style.cursor = isSold ? 'not-allowed' : 'pointer';
              }}
              onPointerOut={() => {
                setHoveredFlat(null);
                document.body.style.cursor = 'default';
              }}
            >
              <planeGeometry args={[specs.size[0], specs.size[1]]} />
              <meshStandardMaterial
                color={color}
                roughness={0.6}
                transparent
                opacity={isHovered ? 0.65 : isSold ? 0.18 : 0.42}
              />
            </mesh>

            {/* Perimeter boundary outline */}
            <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
              <edgesGeometry args={[new THREE.PlaneGeometry(specs.size[0], specs.size[1])]} />
              <lineBasicMaterial
                color={isHovered ? '#BA5D38' : '#5A5E66'}
                linewidth={isHovered ? 2 : 1}
              />
            </lineSegments>

            {/* In-scene Collision-Avoiding Label Pill */}
            <Html
              position={specs.labelOffset}
              center
              distanceFactor={34}
              pointerEvents="none"
            >
              <div
                className={`px-3 py-1.5 rounded-full shadow-elevation backdrop-blur-md text-xs font-sans font-medium transition-all select-none whitespace-nowrap flex items-center gap-1.5 ${
                  isHovered ? 'scale-110 ring-2 ring-accent-terracotta bg-canvas text-ink-primary' : ''
                } ${
                  isSold
                    ? 'bg-canvas-subtle/95 text-ink-muted border border-canvas-muted opacity-80'
                    : 'bg-canvas-light/95 text-ink-primary border border-canvas-muted'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-accent-terracotta text-white flex items-center justify-center font-bold text-[10px]">
                  {flat.unitNumber}
                </span>
                <span className="font-semibold">{flat.type.replace('_', ' ')}</span>
                <span className="text-ink-muted text-[11px]">({flat.carpetAreaSqFt} sq ft)</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
