import React from 'react';
import { RoundedBox } from '@react-three/drei';

interface TvUnitProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const TvUnit: React.FC<TvUnitProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Low Credenza Media Cabinet (Warm Oak & Fluted Panels) */}
      <RoundedBox
        args={[2.2, 0.42, 0.42]}
        radius={0.03}
        smoothness={4}
        position={[0, 0.26, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#8E6746" roughness={0.65} />
      </RoundedBox>

      {/* Fluted Cabinet Front Accents */}
      <mesh position={[0, 0.26, 0.215]}>
        <planeGeometry args={[2.14, 0.36]} />
        <meshStandardMaterial color="#7E5636" roughness={0.6} />
      </mesh>

      {/* Recessed Plinth Base in Dark Charcoal */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[2.05, 0.06, 0.36]} />
        <meshStandardMaterial color="#1E2024" roughness={0.8} />
      </mesh>

      {/* Wall Feature Backing Panel (Vertical Slats) */}
      <mesh position={[0, 1.45, -0.16]} receiveShadow>
        <boxGeometry args={[2.4, 1.9, 0.05]} />
        <meshStandardMaterial color="#DDD7CB" roughness={0.8} />
      </mesh>

      {/* Wall-Mounted Ultra-Thin OLED TV (65-inch) */}
      <group position={[0, 1.35, -0.1]}>
        {/* TV Outer Bezel */}
        <mesh castShadow>
          <boxGeometry args={[1.5, 0.88, 0.03]} />
          <meshStandardMaterial color="#101114" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* OLED Screen (Deep reflective obsidian black) */}
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[1.46, 0.84]} />
          <meshStandardMaterial color="#0A0B0D" roughness={0.1} metalness={0.9} />
        </mesh>
      </group>

      {/* Slim Soundbar */}
      <RoundedBox
        args={[0.9, 0.06, 0.08]}
        radius={0.02}
        smoothness={4}
        position={[0, 0.84, -0.08]}
        castShadow
      >
        <meshStandardMaterial color="#1E2024" roughness={0.5} />
      </RoundedBox>

      {/* Decorative Ceramic Ceramic Vase on Credenza */}
      <group position={[0.78, 0.58, 0.05]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.09, 0.22, 16]} />
          <meshStandardMaterial color="#BA5D38" roughness={0.3} />
        </mesh>
      </group>

      {/* Curated Architecture Books Stack */}
      <group position={[-0.75, 0.5, 0.05]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.26, 0.03, 0.2]} />
          <meshStandardMaterial color="#EFECE6" roughness={0.7} />
        </mesh>
        <mesh position={[0.01, 0.03, 0.01]} castShadow>
          <boxGeometry args={[0.24, 0.025, 0.18]} />
          <meshStandardMaterial color="#4A4E57" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
};
