import React from 'react';
import { RoundedBox } from '@react-three/drei';

interface StudyDeskProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const StudyDesk: React.FC<StudyDeskProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Desk Desktop Slab (Smoked Oak) */}
      <RoundedBox
        args={[1.4, 0.04, 0.7]}
        radius={0.015}
        smoothness={4}
        position={[0, 0.74, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#8E6746" roughness={0.6} />
      </RoundedBox>

      {/* Desk Metal Legs Frame */}
      {[-0.62, 0.62].map((x) => (
        <group key={x} position={[x, 0.36, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.04, 0.72, 0.62]} />
            <meshStandardMaterial color="#1E2024" roughness={0.5} metalness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Floating Wall Bookshelf Overhead */}
      <group position={[0, 1.45, -0.2]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.03, 0.24]} />
          <meshStandardMaterial color="#8E6746" roughness={0.6} />
        </mesh>
        {/* Books on Shelf */}
        <mesh position={[-0.4, 0.12, 0]} castShadow>
          <boxGeometry args={[0.18, 0.22, 0.18]} />
          <meshStandardMaterial color="#BA5D38" roughness={0.7} />
        </mesh>
        <mesh position={[-0.18, 0.1, 0]} castShadow>
          <boxGeometry args={[0.22, 0.18, 0.18]} />
          <meshStandardMaterial color="#363940" roughness={0.7} />
        </mesh>
      </group>

      {/* Sleek Task Chair */}
      <group position={[0, 0, 0.55]} rotation={[0, Math.PI, 0]}>
        {/* Chair Seat */}
        <RoundedBox
          args={[0.48, 0.05, 0.46]}
          radius={0.03}
          smoothness={4}
          position={[0, 0.46, 0]}
          castShadow
        >
          <meshStandardMaterial color="#363940" roughness={0.8} />
        </RoundedBox>
        {/* Curved Backrest */}
        <RoundedBox
          args={[0.44, 0.38, 0.04]}
          radius={0.03}
          smoothness={4}
          position={[0, 0.72, 0.2]}
          castShadow
        >
          <meshStandardMaterial color="#363940" roughness={0.8} />
        </RoundedBox>
        {/* Central Stem & Star Base */}
        <mesh position={[0, 0.24, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.42, 12]} />
          <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.04, 0]} receiveShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.04, 5]} />
          <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>

      {/* Architect's Desk Lamp */}
      <group position={[0.48, 0.76, -0.15]}>
        <mesh position={[0, 0.01, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
          <meshStandardMaterial color="#9E7D47" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.01, 0.01, 0.38, 8]} />
          <meshStandardMaterial color="#9E7D47" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[-0.08, 0.38, 0]} rotation={[0, 0, -0.5]} castShadow>
          <coneGeometry args={[0.07, 0.12, 16]} />
          <meshStandardMaterial color="#9E7D47" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
};
