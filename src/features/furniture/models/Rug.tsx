import React from 'react';
import { RoundedBox } from '@react-three/drei';

interface RugProps {
  position?: [number, number, number];
  size?: [number, number];
  color?: string;
}

export const Rug: React.FC<RugProps> = ({
  position = [0, 0, 0],
  size = [3.2, 2.2],
  color = '#DDD6CA', // Natural textured wool tone
}) => {
  return (
    <group position={position}>
      {/* Soft Woolen Floor Rug */}
      <RoundedBox
        args={[size[0], 0.015, size[1]]}
        radius={0.02}
        smoothness={4}
        position={[0, 0.008, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={color} roughness={0.95} />
      </RoundedBox>

      {/* Subtle Border Hemming Detail */}
      <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size[0] - 0.16, size[1] - 0.16]} />
        <meshStandardMaterial
          color="#D4CCC0"
          roughness={0.98}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
    </group>
  );
};
