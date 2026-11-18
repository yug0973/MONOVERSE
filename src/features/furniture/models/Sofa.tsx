import React from 'react';
import { RoundedBox } from '@react-three/drei';

interface SofaProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  color?: string;
  includeLivingSet?: boolean;
}

export const Sofa: React.FC<SofaProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  color = '#4A4E57', // Deep slate woven textile
  includeLivingSet = true,
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* --- 1. Main Luxury Sofa --- */}
      <group>
        {/* Wood base plinth (Smoked Oak) */}
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 0.08, 0.96]} />
          <meshStandardMaterial color="#2b231d" roughness={0.7} />
        </mesh>

        {/* Main Seat Base Cushion */}
        <RoundedBox
          args={[2.46, 0.28, 0.94]}
          radius={0.06}
          smoothness={4}
          position={[0, 0.24, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={color} roughness={0.85} />
        </RoundedBox>

        {/* Dual Fluffy Seat Toppers */}
        <RoundedBox
          args={[1.18, 0.12, 0.84]}
          radius={0.05}
          smoothness={4}
          position={[-0.6, 0.42, 0.02]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={color} roughness={0.9} />
        </RoundedBox>
        <RoundedBox
          args={[1.18, 0.12, 0.84]}
          radius={0.05}
          smoothness={4}
          position={[0.6, 0.42, 0.02]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={color} roughness={0.9} />
        </RoundedBox>

        {/* Backrest Structure */}
        <RoundedBox
          args={[2.46, 0.44, 0.24]}
          radius={0.06}
          smoothness={4}
          position={[0, 0.56, -0.36]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={color} roughness={0.85} />
        </RoundedBox>

        {/* Back Cushion Bolsters */}
        <RoundedBox
          args={[1.14, 0.32, 0.14]}
          radius={0.06}
          smoothness={4}
          position={[-0.59, 0.58, -0.24]}
          rotation={[-0.12, 0, 0]}
          castShadow
        >
          <meshStandardMaterial color={color} roughness={0.9} />
        </RoundedBox>
        <RoundedBox
          args={[1.14, 0.32, 0.14]}
          radius={0.06}
          smoothness={4}
          position={[0.59, 0.58, -0.24]}
          rotation={[-0.12, 0, 0]}
          castShadow
        >
          <meshStandardMaterial color={color} roughness={0.9} />
        </RoundedBox>

        {/* Left Armrest */}
        <RoundedBox
          args={[0.22, 0.34, 0.94]}
          radius={0.06}
          smoothness={4}
          position={[-1.2, 0.48, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={color} roughness={0.85} />
        </RoundedBox>

        {/* Right Armrest */}
        <RoundedBox
          args={[0.22, 0.34, 0.94]}
          radius={0.06}
          smoothness={4}
          position={[1.2, 0.48, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={color} roughness={0.85} />
        </RoundedBox>

        {/* Accent Pillows */}
        <RoundedBox
          args={[0.38, 0.36, 0.14]}
          radius={0.05}
          smoothness={4}
          position={[-0.88, 0.56, -0.18]}
          rotation={[0.1, 0.35, -0.15]}
          castShadow
        >
          <meshStandardMaterial color="#ba5d38" roughness={0.75} />
        </RoundedBox>
        <RoundedBox
          args={[0.36, 0.36, 0.14]}
          radius={0.05}
          smoothness={4}
          position={[0.86, 0.56, -0.18]}
          rotation={[0.08, -0.3, 0.12]}
          castShadow
        >
          <meshStandardMaterial color="#eadfcf" roughness={0.85} />
        </RoundedBox>
      </group>

      {/* --- 2. Living Room Coffee Table Ensemble & Accent Chair --- */}
      {includeLivingSet && (
        <group>
          {/* Primary Nested Table: Round Calacatta Marble with Brass Rim */}
          <group position={[0, 0, 1.25]}>
            {/* Cylindrical Fluted Pedestal */}
            <mesh position={[0, 0.17, 0]} castShadow>
              <cylinderGeometry args={[0.24, 0.26, 0.34, 32]} />
              <meshStandardMaterial color="#a0804b" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Calacatta Marble Disc Top */}
            <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.55, 0.55, 0.04, 48]} />
              <meshStandardMaterial color="#f7f8fa" roughness={0.15} metalness={0.05} />
            </mesh>
            {/* Slim Brass Perimeter Ring */}
            <mesh position={[0, 0.35, 0]}>
              <torusGeometry args={[0.552, 0.008, 12, 48]} />
              <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
            </mesh>
            {/* Hardcover Art / Architecture Books on Table */}
            <RoundedBox args={[0.24, 0.03, 0.18]} position={[-0.1, 0.385, 0.05]} rotation={[0, 0.25, 0]} radius={0.005} smoothness={4} castShadow>
              <meshStandardMaterial color="#1a1c1e" roughness={0.5} />
            </RoundedBox>
            <RoundedBox args={[0.22, 0.025, 0.16]} position={[-0.08, 0.412, 0.05]} rotation={[0, 0.15, 0]} radius={0.005} smoothness={4} castShadow>
              <meshStandardMaterial color="#ba5d38" roughness={0.6} />
            </RoundedBox>
            {/* Ceramic Minimalist Bowl */}
            <mesh position={[0.18, 0.39, -0.08]} castShadow>
              <sphereGeometry args={[0.07, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
              <meshStandardMaterial color="#e4ddd3" roughness={0.4} />
            </mesh>
          </group>

          {/* Secondary Nested Table: Lower Smoked Oak Oval Satellite */}
          <group position={[0.65, 0, 1.45]}>
            <mesh position={[0, 0.12, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.18, 0.24, 24]} />
              <meshStandardMaterial color="#1f1a17" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.38, 0.38, 0.03, 36]} />
              <meshStandardMaterial color="#2d2621" roughness={0.5} />
            </mesh>
          </group>

          {/* Sculptural Designer Accent Lounge Chair */}
          <group position={[-1.6, 0, 1.15]} rotation={[0, Math.PI / 4 + 0.2, 0]}>
            {/* Metal Swivel Base */}
            <mesh position={[0, 0.06, 0]} castShadow>
              <cylinderGeometry args={[0.26, 0.26, 0.04, 32]} />
              <meshStandardMaterial color="#2a2522" roughness={0.4} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.18, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.22, 16]} />
              <meshStandardMaterial color="#2a2522" roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Deep Curved Seat Cushion (Cream Bouclé) */}
            <RoundedBox args={[0.76, 0.22, 0.74]} position={[0, 0.34, 0]} radius={0.08} smoothness={4} castShadow receiveShadow>
              <meshStandardMaterial color="#f0ece5" roughness={0.9} />
            </RoundedBox>
            {/* Curved Enveloping Backrest */}
            <RoundedBox args={[0.74, 0.46, 0.2]} position={[0, 0.58, -0.28]} radius={0.08} smoothness={4} castShadow receiveShadow>
              <meshStandardMaterial color="#f0ece5" roughness={0.9} />
            </RoundedBox>
            {/* Arm Wings */}
            <RoundedBox args={[0.16, 0.32, 0.6]} position={[-0.34, 0.48, -0.05]} radius={0.06} smoothness={4} castShadow>
              <meshStandardMaterial color="#f0ece5" roughness={0.9} />
            </RoundedBox>
            <RoundedBox args={[0.16, 0.32, 0.6]} position={[0.34, 0.48, -0.05]} radius={0.06} smoothness={4} castShadow>
              <meshStandardMaterial color="#f0ece5" roughness={0.9} />
            </RoundedBox>
          </group>

          {/* Architectural Floor Lamp */}
          <group position={[-1.75, 0, -0.4]}>
            {/* Heavy Base Disc */}
            <mesh position={[0, 0.02, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
              <meshStandardMaterial color="#1a1c1e" roughness={0.4} metalness={0.7} />
            </mesh>
            {/* Slender Brass Vertical Rod */}
            <mesh position={[0, 0.9, 0]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 1.76, 16]} />
              <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
            </mesh>
            {/* Cone / Dome Brass Shade */}
            <mesh position={[0.12, 1.68, 0]} rotation={[0, 0, -0.25]} castShadow>
              <coneGeometry args={[0.14, 0.22, 24, 1, true]} />
              <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} side={2} />
            </mesh>
            {/* Warm Lamp Light Source */}
            <pointLight position={[0.12, 1.6, 0]} intensity={0.45} distance={2.5} color="#ffe2b0" />
          </group>
        </group>
      )}
    </group>
  );
};
