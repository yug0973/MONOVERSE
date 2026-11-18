import React from 'react';
import { RoundedBox } from '@react-three/drei';

interface BedProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const Bed: React.FC<BedProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 1. Extended Architectural Fluted Headboard Panel (3.4m wide) */}
      <group position={[0, 0.8, -1.08]}>
        {/* Main Fluted Backboard */}
        <RoundedBox args={[3.4, 1.6, 0.08]} radius={0.02} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#2d2926" roughness={0.65} metalness={0.05} />
        </RoundedBox>

        {/* Vertical Fluted Wood Slat Texture slats */}
        {[-1.6, -1.3, -1.0, -0.7, -0.4, -0.1, 0.2, 0.5, 0.8, 1.1, 1.4].map((x, i) => (
          <mesh key={i} position={[x, 0, 0.045]} castShadow>
            <boxGeometry args={[0.04, 1.56, 0.015]} />
            <meshStandardMaterial color="#423b35" roughness={0.6} />
          </mesh>
        ))}

        {/* Headboard Top Indirect LED Glow Strip */}
        <mesh position={[0, 0.81, 0]}>
          <boxGeometry args={[3.36, 0.02, 0.06]} />
          <meshBasicMaterial color="#fff3db" />
        </mesh>
        <pointLight position={[0, 0.86, 0.1]} intensity={0.35} distance={1.8} color="#ffe8c2" />

        {/* Padded Center Fabric Acoustic Inset */}
        <RoundedBox args={[2.2, 1.1, 0.06]} position={[0, -0.12, 0.06]} radius={0.04} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#66615b" roughness={0.9} />
        </RoundedBox>
      </group>

      {/* 2. Platform Bed Base & Premium Mattress */}
      <group position={[0, 0, 0]}>
        {/* Platform Bed Base with Low Floating Shadow Reveal */}
        <RoundedBox args={[2.08, 0.22, 2.18]} position={[0, 0.14, 0.02]} radius={0.04} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#36322e" roughness={0.7} />
        </RoundedBox>

        {/* Pillow-top Mattress */}
        <RoundedBox args={[1.96, 0.32, 2.04]} position={[0, 0.39, 0.03]} radius={0.06} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#f9f8f5" roughness={0.88} />
        </RoundedBox>

        {/* Belgian Linen Folded Duvet */}
        <RoundedBox args={[1.98, 0.15, 1.4]} position={[0, 0.48, 0.34]} radius={0.04} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#ded7cc" roughness={0.92} />
        </RoundedBox>

        {/* Terracotta Decorative Bed Runner */}
        <RoundedBox args={[1.99, 0.02, 0.34]} position={[0, 0.56, 0.82]} radius={0.01} smoothness={4} receiveShadow>
          <meshStandardMaterial color="#ba5d38" roughness={0.8} />
        </RoundedBox>

        {/* Layered Sleeping Pillows (Back European Shams) */}
        <RoundedBox args={[0.7, 0.22, 0.16]} position={[-0.52, 0.62, -0.74]} rotation={[0.25, 0, 0]} radius={0.05} smoothness={4} castShadow>
          <meshStandardMaterial color="#e5dfd5" roughness={0.9} />
        </RoundedBox>
        <RoundedBox args={[0.7, 0.22, 0.16]} position={[0.52, 0.62, -0.74]} rotation={[0.25, 0, 0]} radius={0.05} smoothness={4} castShadow>
          <meshStandardMaterial color="#e5dfd5" roughness={0.9} />
        </RoundedBox>

        {/* Front Pillows */}
        <RoundedBox args={[0.66, 0.18, 0.38]} position={[-0.52, 0.57, -0.56]} rotation={[0.15, 0, 0]} radius={0.05} smoothness={4} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </RoundedBox>
        <RoundedBox args={[0.66, 0.18, 0.38]} position={[0.52, 0.57, -0.56]} rotation={[0.15, 0, 0]} radius={0.05} smoothness={4} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </RoundedBox>

        {/* Lumbar Accent Velvet Pillow */}
        <RoundedBox args={[0.48, 0.18, 0.14]} position={[0, 0.59, -0.42]} rotation={[0.18, 0, 0]} radius={0.04} smoothness={4} castShadow>
          <meshStandardMaterial color="#2c3a35" roughness={0.7} />
        </RoundedBox>

        {/* End-of-Bed Luxury Bench */}
        <group position={[0, 0, 1.28]}>
          <RoundedBox args={[1.6, 0.12, 0.44]} position={[0, 0.38, 0]} radius={0.04} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#443f3b" roughness={0.85} />
          </RoundedBox>
          {/* Slender Dark Bronze Bench Legs */}
          {[-0.72, 0.72].map((x, xi) =>
            [-0.16, 0.16].map((z, zi) => (
              <mesh key={`${xi}-${zi}`} position={[x, 0.16, z]} castShadow>
                <cylinderGeometry args={[0.015, 0.015, 0.32, 12]} />
                <meshStandardMaterial color="#1a1816" roughness={0.3} metalness={0.7} />
              </mesh>
            ))
          )}
        </group>
      </group>

      {/* 3. Floating Cantilever Nightstands with Suspended Brass Pendants */}
      {/* Left Nightstand & Pendant */}
      <group position={[-1.38, 0, -0.92]}>
        {/* Floating Cabinet Block */}
        <RoundedBox args={[0.55, 0.28, 0.44]} position={[0, 0.38, 0]} radius={0.02} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#352e2a" roughness={0.6} />
        </RoundedBox>
        {/* Brushed Brass Linear Drawer Pull */}
        <mesh position={[0, 0.38, 0.23]} castShadow>
          <boxGeometry args={[0.18, 0.015, 0.015]} />
          <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
        </mesh>
        {/* Glass Water Carafe */}
        <mesh position={[0.12, 0.58, 0.05]} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 0.12, 16]} />
          <meshStandardMaterial color="#e0ebf0" roughness={0.1} metalness={0.9} transparent opacity={0.7} />
        </mesh>
        {/* Ceiling-Suspended Brass Tube Pendant */}
        <mesh position={[0, 1.45, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 1.1, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 16]} />
          <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
        </mesh>
        {/* Warm Reading Light Glow */}
        <pointLight position={[0, 0.72, 0]} intensity={0.3} distance={1.2} color="#ffe2b0" />
      </group>

      {/* Right Nightstand & Pendant */}
      <group position={[1.38, 0, -0.92]}>
        {/* Floating Cabinet Block */}
        <RoundedBox args={[0.55, 0.28, 0.44]} position={[0, 0.38, 0]} radius={0.02} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial color="#352e2a" roughness={0.6} />
        </RoundedBox>
        {/* Brushed Brass Linear Drawer Pull */}
        <mesh position={[0, 0.38, 0.23]} castShadow>
          <boxGeometry args={[0.18, 0.015, 0.015]} />
          <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
        </mesh>
        {/* Reading Tablet / Journal */}
        <mesh position={[-0.08, 0.53, 0.02]} rotation={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[0.18, 0.015, 0.24]} />
          <meshStandardMaterial color="#1a1c1e" roughness={0.4} />
        </mesh>
        {/* Ceiling-Suspended Brass Tube Pendant */}
        <mesh position={[0, 1.45, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 1.1, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 16]} />
          <meshStandardMaterial color="#c29b62" roughness={0.3} metalness={0.85} />
        </mesh>
        {/* Warm Reading Light Glow */}
        <pointLight position={[0, 0.72, 0]} intensity={0.3} distance={1.2} color="#ffe2b0" />
      </group>
    </group>
  );
};
