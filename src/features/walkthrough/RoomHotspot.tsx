import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { RoomGeometry } from '../../types/building';

interface RoomHotspotProps {
  room: RoomGeometry;
}

export const RoomHotspot: React.FC<RoomHotspotProps> = ({ room }) => {
  const {
    activeRoomId,
    hoveredRoomId,
    enterRoom,
    setHoveredRoom,
  } = useAppStore();

  const ringRef = useRef<THREE.Mesh>(null);
  const isCurrentRoom = activeRoomId === room.id;
  const isHovered = hoveredRoomId === room.id;

  useFrame((state) => {
    if (ringRef.current && !isCurrentRoom) {
      const t = state.clock.getElapsedTime();
      const s = 1 + Math.sin(t * 3 + room.position[0]) * 0.12;
      ringRef.current.scale.set(s, s, 1);
    }
  });

  if (isCurrentRoom) return null; // Don't show hotspot on current standing position

  return (
    <group position={[room.walkthroughHotspot[0], 0.04, room.walkthroughHotspot[2]]}>
      {/* Outer interactive hit zone */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => {
          e.stopPropagation();
          enterRoom(room.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredRoom(room.id);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHoveredRoom(null);
          document.body.style.cursor = 'default';
        }}
      >
        <circleGeometry args={[0.6, 24]} />
        <meshBasicMaterial
          color={isHovered ? '#BA5D38' : '#FFFFFF'}
          transparent
          opacity={isHovered ? 0.35 : 0.15}
        />
      </mesh>

      {/* Pulsing ring beacon */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.42, 32]} />
        <meshBasicMaterial
          color={isHovered ? '#BA5D38' : '#9E7D47'}
          transparent
          opacity={isHovered ? 0.9 : 0.65}
        />
      </mesh>

      {/* Glowing center dot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#BA5D38" />
      </mesh>
    </group>
  );
};
