import React from 'react';
import { RoundedBox } from '@react-three/drei';

interface WardrobeProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const Wardrobe: React.FC<WardrobeProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 1. Cabinet Outer Carcass (Dark Smoked Oak) */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 2.5, 0.62]} />
        <meshStandardMaterial color="#221e1b" roughness={0.7} />
      </mesh>

      {/* 2. Recessed Interior Compartments */}
      <mesh position={[0, 1.25, 0.04]} receiveShadow>
        <boxGeometry args={[1.82, 2.42, 0.52]} />
        <meshStandardMaterial color="#2c2723" roughness={0.8} />
      </mesh>

      {/* Vertical Partition Divider */}
      <mesh position={[0, 1.25, 0.04]}>
        <boxGeometry args={[0.02, 2.4, 0.5]} />
        <meshStandardMaterial color="#221e1b" roughness={0.7} />
      </mesh>

      {/* Interior Horizontal Shelves */}
      <mesh position={[-0.45, 1.85, 0.04]}>
        <boxGeometry args={[0.88, 0.02, 0.48]} />
        <meshStandardMaterial color="#221e1b" roughness={0.7} />
      </mesh>
      <mesh position={[0.45, 1.85, 0.04]}>
        <boxGeometry args={[0.88, 0.02, 0.48]} />
        <meshStandardMaterial color="#221e1b" roughness={0.7} />
      </mesh>
      <mesh position={[-0.45, 0.6, 0.04]}>
        <boxGeometry args={[0.88, 0.02, 0.48]} />
        <meshStandardMaterial color="#221e1b" roughness={0.7} />
      </mesh>

      {/* Brushed Brass Clothes Hanging Rail */}
      <mesh position={[0.45, 1.75, 0.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.86, 16]} />
        <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Folded Designer Linens on Shelves */}
      <RoundedBox args={[0.34, 0.08, 0.28]} position={[-0.45, 1.9, 0.04]} radius={0.01} smoothness={4}>
        <meshStandardMaterial color="#e3ddd4" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.3, 0.06, 0.26]} position={[-0.45, 1.97, 0.04]} radius={0.01} smoothness={4}>
        <meshStandardMaterial color="#9c8777" roughness={0.9} />
      </RoundedBox>

      {/* 3. Internal Vertical Warm LED Strip Lights */}
      <mesh position={[-0.88, 1.25, 0.22]}>
        <boxGeometry args={[0.01, 2.36, 0.01]} />
        <meshBasicMaterial color="#fff3db" />
      </mesh>
      <mesh position={[0.88, 1.25, 0.22]}>
        <boxGeometry args={[0.01, 2.36, 0.01]} />
        <meshBasicMaterial color="#fff3db" />
      </mesh>
      <pointLight position={[0, 1.5, 0.15]} intensity={0.4} distance={1.8} color="#ffe2b0" />

      {/* 4. Luxury Tinted Fluted Glass Doors with Anodized Dark Bronze Slim Mullions */}
      {[-0.46, 0.46].map((x, i) => (
        <group key={i} position={[x, 1.25, 0.3]}>
          {/* Outer Slim Bronze Frame */}
          <mesh castShadow>
            <boxGeometry args={[0.9, 2.46, 0.02]} />
            <meshStandardMaterial color="#1f1c1a" roughness={0.4} metalness={0.7} />
          </mesh>

          {/* Semi-transparent Fluted Bronze Glass Panel */}
          <mesh position={[0, 0, 0.01]}>
            <boxGeometry args={[0.84, 2.4, 0.005]} />
            <meshStandardMaterial
              color="#54493b"
              roughness={0.2}
              metalness={0.3}
              transparent
              opacity={0.45}
            />
          </mesh>

          {/* Full-Height Integrated Linear Brass Pull */}
          <mesh position={[i === 0 ? 0.41 : -0.41, 0, 0.02]} castShadow>
            <boxGeometry args={[0.015, 1.2, 0.015]} />
            <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Bottom Plinth Recess */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <boxGeometry args={[1.86, 0.04, 0.58]} />
        <meshStandardMaterial color="#111111" roughness={0.9} />
      </mesh>
    </group>
  );
};
