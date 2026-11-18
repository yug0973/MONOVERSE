import React from 'react';
import { RoundedBox } from '@react-three/drei';

interface KitchenProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  isPremium?: boolean;
}

export const Kitchen: React.FC<KitchenProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isPremium = true,
}) => {
  return (
    <group position={position} rotation={rotation}>
      {/* 1. Main Base Counter (L-Shape or Parallel) */}
      <group position={[0, 0, -0.6]}>
        {/* Counter Base Cabinet Joinery */}
        <RoundedBox args={[2.8, 0.86, 0.7]} position={[0, 0.43, 0]} radius={0.015} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#22252a" roughness={0.4} metalness={0.1} />
        </RoundedBox>

        {/* Counter Kickboard / Toe Recess */}
        <mesh position={[0, 0.05, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[2.76, 0.1, 0.6]} />
          <meshStandardMaterial color="#111315" roughness={0.8} />
        </mesh>

        {/* Calacatta Quartz Countertop Slab */}
        <RoundedBox args={[2.84, 0.06, 0.74]} position={[0, 0.89, 0]} radius={0.02} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#f7f8f9" roughness={0.15} metalness={0.05} />
        </RoundedBox>

        {/* Countertop Backsplash */}
        <mesh position={[0, 1.25, -0.36]} receiveShadow>
          <boxGeometry args={[2.84, 0.66, 0.02]} />
          <meshStandardMaterial color="#e8ecef" roughness={0.2} metalness={0.05} />
        </mesh>

        {/* Undermount Double Sink */}
        <group position={[-0.7, 0.92, 0]}>
          <mesh position={[0, 0, 0]} receiveShadow>
            <boxGeometry args={[0.7, 0.02, 0.44]} />
            <meshStandardMaterial color="#555d65" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Sink Basins (Depressions) */}
          <mesh position={[-0.18, 0.01, 0]}>
            <boxGeometry args={[0.28, 0.01, 0.36]} />
            <meshStandardMaterial color="#2d3238" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh position={[0.18, 0.01, 0]}>
            <boxGeometry args={[0.28, 0.01, 0.36]} />
            <meshStandardMaterial color="#2d3238" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Matte Black Gooseneck Faucet */}
          <group position={[0, 0.01, -0.16]}>
            <mesh position={[0, 0.16, 0]} castShadow>
              <cylinderGeometry args={[0.018, 0.022, 0.32, 16]} />
              <meshStandardMaterial color="#1a1c1e" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.32, 0.08]} rotation={[0.4, 0, 0]} castShadow>
              <cylinderGeometry args={[0.016, 0.018, 0.18, 16]} />
              <meshStandardMaterial color="#1a1c1e" roughness={0.3} metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.28, 0.14]} castShadow>
              <sphereGeometry args={[0.022, 16, 16]} />
              <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
            </mesh>
          </group>
        </group>

        {/* 4-Burner Glass Induction Cooktop */}
        <group position={[0.65, 0.925, 0]}>
          {/* Black Glass Plate */}
          <RoundedBox args={[0.75, 0.01, 0.5]} radius={0.008} smoothness={4} receiveShadow>
            <meshStandardMaterial color="#0d0e10" roughness={0.1} metalness={0.9} />
          </RoundedBox>
          {/* Burner Zones */}
          <mesh position={[-0.2, 0.006, -0.11]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.07, 0.085, 24]} />
            <meshBasicMaterial color="#d43827" />
          </mesh>
          <mesh position={[0.2, 0.006, -0.11]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.06, 0.075, 24]} />
            <meshBasicMaterial color="#555b62" />
          </mesh>
          <mesh position={[-0.2, 0.006, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.08, 0.095, 24]} />
            <meshBasicMaterial color="#555b62" />
          </mesh>
          <mesh position={[0.2, 0.006, 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.07, 0.085, 24]} />
            <meshBasicMaterial color="#555b62" />
          </mesh>
        </group>

        {/* Overhead Cabinets Wall */}
        <group position={[0, 1.85, -0.2]}>
          <RoundedBox args={[2.8, 0.72, 0.38]} radius={0.015} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#e5ded6" roughness={0.35} metalness={0.05} />
          </RoundedBox>
          {/* Under-cabinet Warm LED Task Lighting Strip */}
          <mesh position={[0, -0.37, 0.05]}>
            <boxGeometry args={[2.7, 0.02, 0.28]} />
            <meshBasicMaterial color="#fff3db" />
          </mesh>
          <pointLight position={[0, -0.4, 0.05]} intensity={0.4} distance={1.8} color="#ffe8c2" />
        </group>

        {/* Designer Black Stainless Chimney Hood */}
        <group position={[0.65, 1.68, 0]}>
          <RoundedBox args={[0.82, 0.12, 0.52]} position={[0, 0, 0]} radius={0.01} smoothness={4} castShadow>
            <meshStandardMaterial color="#1b1d20" roughness={0.35} metalness={0.7} />
          </RoundedBox>
          <mesh position={[0, 0.34, -0.06]} castShadow>
            <boxGeometry args={[0.26, 0.56, 0.3]} />
            <meshStandardMaterial color="#1b1d20" roughness={0.35} metalness={0.7} />
          </mesh>
          {/* Cooktop Light */}
          <pointLight position={[0, -0.08, 0]} intensity={0.5} distance={1.2} color="#fff6e8" />
        </group>
      </group>

      {/* 2. Island Counter with Bar Seating (Premium Tier) */}
      {isPremium && (
        <group position={[0, 0, 0.75]}>
          {/* Quartz Waterfall Island Slab */}
          {/* Top */}
          <RoundedBox args={[2.1, 0.06, 0.9]} position={[0, 0.89, 0]} radius={0.02} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#f7f8f9" roughness={0.15} metalness={0.05} />
          </RoundedBox>
          {/* Left Waterfall Leg */}
          <RoundedBox args={[0.06, 0.89, 0.9]} position={[-1.02, 0.445, 0]} radius={0.015} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#f7f8f9" roughness={0.15} metalness={0.05} />
          </RoundedBox>
          {/* Right Waterfall Leg */}
          <RoundedBox args={[0.06, 0.89, 0.9]} position={[1.02, 0.445, 0]} radius={0.015} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#f7f8f9" roughness={0.15} metalness={0.05} />
          </RoundedBox>
          {/* Island Front Dark Oak Joinery */}
          <RoundedBox args={[1.96, 0.84, 0.65]} position={[0, 0.43, -0.1]} radius={0.015} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#2d2926" roughness={0.5} metalness={0.05} />
          </RoundedBox>

          {/* Luxury Bar Stools (Pair) */}
          {[-0.5, 0.5].map((xOffset, idx) => (
            <group key={idx} position={[xOffset, 0, 0.6]}>
              {/* Brass/Bronze Metal Frame */}
              <mesh position={[-0.18, 0.32, -0.18]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.64, 12]} />
                <meshStandardMaterial color="#a8894d" roughness={0.3} metalness={0.8} />
              </mesh>
              <mesh position={[0.18, 0.32, -0.18]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.64, 12]} />
                <meshStandardMaterial color="#a8894d" roughness={0.3} metalness={0.8} />
              </mesh>
              <mesh position={[-0.18, 0.32, 0.18]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.64, 12]} />
                <meshStandardMaterial color="#a8894d" roughness={0.3} metalness={0.8} />
              </mesh>
              <mesh position={[0.18, 0.32, 0.18]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.64, 12]} />
                <meshStandardMaterial color="#a8894d" roughness={0.3} metalness={0.8} />
              </mesh>
              {/* Footrest Ring */}
              <mesh position={[0, 0.2, 0]}>
                <torusGeometry args={[0.2, 0.01, 8, 24]} />
                <meshStandardMaterial color="#a8894d" roughness={0.3} metalness={0.8} />
              </mesh>
              {/* Leather Upholstered Seat Cushion */}
              <RoundedBox args={[0.42, 0.08, 0.42]} position={[0, 0.66, 0]} radius={0.03} smoothness={4} castShadow receiveShadow>
                <meshStandardMaterial color="#352e2a" roughness={0.6} />
              </RoundedBox>
              {/* Curved Low Backrest */}
              <RoundedBox args={[0.38, 0.18, 0.06]} position={[0, 0.78, 0.18]} radius={0.02} smoothness={4} castShadow>
                <meshStandardMaterial color="#352e2a" roughness={0.6} />
              </RoundedBox>
            </group>
          ))}
        </group>
      )}

      {/* 3. Tall Appliance Tower (Pantry, Built-in Oven & Refrigerator) */}
      <group position={[-1.75, 0, -0.3]}>
        {/* Full Height Joinery Tower */}
        <RoundedBox args={[0.65, 2.3, 0.7]} position={[0, 1.15, 0]} radius={0.015} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#22252a" roughness={0.4} metalness={0.1} />
        </RoundedBox>
        {/* Built-in Convection Oven */}
        <group position={[0.02, 1.1, 0.34]}>
          <RoundedBox args={[0.58, 0.52, 0.04]} radius={0.01} smoothness={4} castShadow>
            <meshStandardMaterial color="#16181b" roughness={0.2} metalness={0.85} />
          </RoundedBox>
          {/* Glass Viewport */}
          <mesh position={[0, -0.04, 0.02]}>
            <boxGeometry args={[0.44, 0.3, 0.01]} />
            <meshStandardMaterial color="#0f1113" roughness={0.1} metalness={0.9} transparent opacity={0.85} />
          </mesh>
          {/* Warm Oven Interior Glow */}
          <pointLight position={[0, -0.04, 0.08]} intensity={0.2} distance={0.8} color="#fca834" />
          {/* Horizontal Handle */}
          <mesh position={[0, 0.16, 0.04]} castShadow>
            <boxGeometry args={[0.46, 0.02, 0.02]} />
            <meshStandardMaterial color="#e0e3e6" roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
