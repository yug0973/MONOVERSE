import React from 'react';
import { RoundedBox } from '@react-three/drei';

interface DiningSetProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const DiningSet: React.FC<DiningSetProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Dining Table Top */}
      <RoundedBox
        args={[1.9, 0.06, 0.95]}
        radius={0.02}
        smoothness={4}
        position={[0, 0.74, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#362E28" roughness={0.5} />
      </RoundedBox>

      {/* Table Legs (Minimalist dark metal frame) */}
      {[
        [-0.82, -0.38],
        [0.82, -0.38],
        [-0.82, 0.38],
        [0.82, 0.38],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]} castShadow>
          <cylinderGeometry args={[0.025, 0.02, 0.72, 12]} />
          <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}

      {/* Center Table Ceramic Centerpiece Bowl */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.08, 0.08, 20]} />
        <meshStandardMaterial color="#E8E2D5" roughness={0.3} />
      </mesh>

      {/* Overhead Brass Linear Pendant Fixture */}
      <group position={[0, 2.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 0.03, 0.06]} />
          <meshStandardMaterial color="#9E7D47" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Suspension Wires */}
        <mesh position={[-0.5, 0.3, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.6, 6]} />
          <meshStandardMaterial color="#1E2024" />
        </mesh>
        <mesh position={[0.5, 0.3, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.6, 6]} />
          <meshStandardMaterial color="#1E2024" />
        </mesh>
        {/* Soft downward warm glow */}
        <pointLight color="#FFEED1" intensity={0.8} distance={3.5} decay={2} />
      </group>

      {/* 6 Dining Chairs */}
      {/* Front Row (3 Chairs) */}
      <Chair position={[-0.55, 0, 0.68]} rotation={[0, 0, 0]} />
      <Chair position={[0, 0, 0.68]} rotation={[0, 0, 0]} />
      <Chair position={[0.55, 0, 0.68]} rotation={[0, 0, 0]} />

      {/* Back Row (3 Chairs) */}
      <Chair position={[-0.55, 0, -0.68]} rotation={[0, Math.PI, 0]} />
      <Chair position={[0, 0, -0.68]} rotation={[0, Math.PI, 0]} />
      <Chair position={[0.55, 0, -0.68]} rotation={[0, Math.PI, 0]} />
    </group>
  );
};

interface ChairProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

const Chair: React.FC<ChairProps> = ({ position, rotation }) => {
  return (
    <group position={position} rotation={rotation}>
      {/* Seat Cushion */}
      <RoundedBox
        args={[0.44, 0.05, 0.42]}
        radius={0.02}
        smoothness={4}
        position={[0, 0.44, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#4A4E57" roughness={0.8} />
      </RoundedBox>

      {/* Curved Backrest */}
      <RoundedBox
        args={[0.42, 0.36, 0.04]}
        radius={0.02}
        smoothness={4}
        position={[0, 0.68, -0.19]}
        rotation={[-0.08, 0, 0]}
        castShadow
      >
        <meshStandardMaterial color="#4A4E57" roughness={0.8} />
      </RoundedBox>

      {/* 4 Tapered Legs */}
      {[
        [-0.18, -0.16],
        [0.18, -0.16],
        [-0.18, 0.16],
        [0.18, 0.16],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow>
          <cylinderGeometry args={[0.015, 0.01, 0.44, 8]} />
          <meshStandardMaterial color="#1E2024" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
    </group>
  );
};
