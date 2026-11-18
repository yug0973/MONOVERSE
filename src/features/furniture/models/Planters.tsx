import React from 'react';

interface PlantersProps {
  position?: [number, number, number];
  scale?: number;
  potColor?: string;
}

export const Planters: React.FC<PlantersProps> = ({
  position = [0, 0, 0],
  scale = 1,
  potColor = '#EAE5DC', // Architectural fluted ceramic
}) => {
  return (
    <group position={position} scale={scale}>
      {/* Ceramic Pot */}
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.22, 0.64, 24]} />
        <meshStandardMaterial color={potColor} roughness={0.5} />
      </mesh>

      {/* Pot Rim Lip */}
      <mesh position={[0, 0.64, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.27, 0.04, 24]} />
        <meshStandardMaterial color={potColor} roughness={0.4} />
      </mesh>

      {/* Dark Soil Bed */}
      <mesh position={[0, 0.61, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.02, 16]} />
        <meshStandardMaterial color="#2B241E" roughness={0.9} />
      </mesh>

      {/* Central Trunk */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.5, 8]} />
        <meshStandardMaterial color="#4A3B32" roughness={0.8} />
      </mesh>

      {/* Stylized Architectural Foliage Leaves */}
      {[
        { pos: [0.18, 1.05, 0.12], rot: [0.3, 0.5, -0.4], sz: [0.24, 0.38] },
        { pos: [-0.16, 1.15, -0.1], rot: [-0.4, -0.6, 0.5], sz: [0.26, 0.42] },
        { pos: [0.08, 1.28, -0.18], rot: [-0.5, 0.3, -0.3], sz: [0.25, 0.4] },
        { pos: [-0.12, 1.35, 0.15], rot: [0.4, -0.5, 0.4], sz: [0.28, 0.44] },
        { pos: [0.02, 1.5, 0.02], rot: [0.1, 0.2, 0], sz: [0.28, 0.46] },
      ].map((leaf, idx) => (
        <mesh
          key={idx}
          position={leaf.pos as [number, number, number]}
          rotation={leaf.rot as [number, number, number]}
          castShadow
        >
          <boxGeometry args={[leaf.sz[0], 0.005, leaf.sz[1]]} />
          <meshStandardMaterial
            color="#2E5A44"
            roughness={0.45}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
};
