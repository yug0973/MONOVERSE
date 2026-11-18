import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';

const vTarget = new THREE.Vector3();
const vLookAt = new THREE.Vector3();

export const CameraRig: React.FC = () => {
  const {
    viewMode,
    selectedFloorNumber,
    selectedFlatId,
    activeRoomId,
    activeHotspot,
    prefersReducedMotion,
  } = useAppStore();

  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  // Time accumulator for slow cinematic landing drift
  const timeRef = useRef<number>(0);

  // Transition state: only interpolate camera when switching modes, never while user orbits!
  const isTransitioningRef = useRef<boolean>(true);
  const isUserDraggingRef = useRef<boolean>(false);

  // Walkthrough yaw & pitch tracking
  const yawRef = useRef<number>(Math.PI);
  const pitchRef = useRef<number>(0);
  const isDraggingWalkthroughRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const prevViewModeRef = useRef<string>(viewMode);
  const prevFloorRef = useRef<number | null>(selectedFloorNumber);
  const prevFlatRef = useRef<string | null>(selectedFlatId);

  // Dynamic Camera FOV adjustment: 60° spacious wide-angle in walkthrough, 40° cinematic telephoto in exterior/dollhouse
  useEffect(() => {
    const perspCamera = camera as THREE.PerspectiveCamera;
    const targetFov = viewMode === 'walkthrough' ? 60 : 40;
    if (perspCamera.fov !== targetFov) {
      perspCamera.fov = targetFov;
      perspCamera.updateProjectionMatrix();
    }
  }, [viewMode, camera]);

  // Handle activeRoomId initial orientation in walkthrough
  useEffect(() => {
    if (viewMode === 'walkthrough') {
      const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;
      const room = flat?.rooms.find((r) => r.id === activeRoomId);
      if (room) {
        const [hx, hy, hz] = room.walkthroughHotspot;
        const dist = camera.position.distanceTo(new THREE.Vector3(hx, hy, hz));
        if (dist > 15 || prevViewModeRef.current !== 'walkthrough') {
          camera.position.set(hx, hy, hz);
        }

        const dx = room.hotspotLookAt[0] - hx;
        const dy = room.hotspotLookAt[1] - hy;
        const dz = room.hotspotLookAt[2] - hz;

        yawRef.current = Math.atan2(dx, dz);
        pitchRef.current = Math.atan2(dy, Math.hypot(dx, dz));
      }
    }
  }, [viewMode, activeRoomId, selectedFlatId, camera]);

  // Whenever viewMode, floor, or flat changes, trigger a smooth transition
  useEffect(() => {
    isTransitioningRef.current = true;

    if (viewMode === 'building') {
      vLookAt.set(0, 30, 0);
      const distFromCenter = Math.hypot(camera.position.x, camera.position.z);
      if (distFromCenter < 40 || camera.position.y > 65 || camera.position.y < 12) {
        vTarget.set(52, 38, 56);
      } else {
        vTarget.copy(camera.position);
      }
    } else if (viewMode === 'dollhouse') {
      vLookAt.set(0, 0.5, -6.0);
      vTarget.set(0, 15.5, 7.5);
    } else if (viewMode === 'floor_slice') {
      const targetHeight = 12.68 + ((selectedFloorNumber || 1) - 1) * 4.0;
      vLookAt.set(0, targetHeight, 0);
      const angle = controlsRef.current ? controlsRef.current.getAzimuthalAngle() : 0.7;
      vTarget.set(Math.sin(angle) * 38, targetHeight + 24, Math.cos(angle) * 38);
    }

    prevViewModeRef.current = viewMode;
    prevFloorRef.current = selectedFloorNumber;
    prevFlatRef.current = selectedFlatId;
  }, [viewMode, selectedFloorNumber, selectedFlatId, camera]);

  // Pointer listeners for walkthrough look-around with pointer capture
  useEffect(() => {
    const domElement = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      if (viewMode === 'walkthrough') {
        isDraggingWalkthroughRef.current = true;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };
        try {
          domElement.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingWalkthroughRef.current && viewMode === 'walkthrough') {
        const dx = e.clientX - prevPointerRef.current.x;
        const dy = e.clientY - prevPointerRef.current.y;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };

        // Crisp, immediate look-around response
        yawRef.current -= dx * 0.0035;
        pitchRef.current -= dy * 0.0028;

        // Clamp pitch to prevent flipping upside down
        pitchRef.current = Math.max(-0.65, Math.min(0.65, pitchRef.current));
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingWalkthroughRef.current) {
        isDraggingWalkthroughRef.current = false;
        try {
          domElement.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    domElement.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [gl, viewMode]);

  useFrame((_, delta) => {
    timeRef.current += delta;

    if (viewMode === 'landing') {
      // Gentle cinematic drift in landing view
      const driftAngle = Math.sin(timeRef.current * 0.12) * 0.1;
      const radius = 78;
      const cx = Math.sin(0.6 + driftAngle) * radius;
      const cz = Math.cos(0.6 + driftAngle) * radius;
      const cy = 34 + Math.cos(timeRef.current * 0.08) * 1.5;

      vTarget.set(cx, cy, cz);
      vLookAt.set(0, 30, 0);

      const lerpSpeed = prefersReducedMotion ? 1.0 : Math.min(delta * 2.5, 0.1);
      camera.position.lerp(vTarget, lerpSpeed);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(vLookAt, lerpSpeed);
        controlsRef.current.update();
      }
      return;
    }

    if (viewMode === 'walkthrough') {
      const targetX = activeHotspot ? activeHotspot[0] : 6.2;
      const targetY = 1.6;
      const targetZ = activeHotspot ? activeHotspot[2] : -7.5;

      // Smooth camera position glide between room hotspots
      vTarget.set(targetX, targetY, targetZ);
      if (camera.position.distanceTo(vTarget) > 0.01) {
        camera.position.lerp(vTarget, Math.min(delta * 5.0, 0.3));
      }

      // Calculate look direction directly from yaw and pitch
      const lookDist = 10;
      const lx = camera.position.x + Math.sin(yawRef.current) * Math.cos(pitchRef.current) * lookDist;
      const ly = camera.position.y + Math.sin(pitchRef.current) * lookDist;
      const lz = camera.position.z + Math.cos(yawRef.current) * Math.cos(pitchRef.current) * lookDist;

      vLookAt.set(lx, ly, lz);
      camera.lookAt(vLookAt);
      return;
    }

    // In building, floor_slice, or dollhouse:
    // Only interpolate camera during the initial transition!
    if (isTransitioningRef.current && !isUserDraggingRef.current) {
      const lerpSpeed = prefersReducedMotion ? 1.0 : Math.min(delta * 3.2, 0.15);
      camera.position.lerp(vTarget, lerpSpeed);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(vLookAt, lerpSpeed);
      }

      // Check if transition is complete
      const dist = camera.position.distanceTo(vTarget);
      if (dist < 0.25) {
        isTransitioningRef.current = false;
      }
    }

    // ALWAYS update OrbitControls so damping and drag physics never freeze!
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.09}
      rotateSpeed={0.8}
      zoomSpeed={0.95}
      panSpeed={0.8}
      minDistance={6}
      maxDistance={110}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minPolarAngle={Math.PI / 16}
      enabled={viewMode !== 'walkthrough'}
      onStart={() => {
        isUserDraggingRef.current = true;
        isTransitioningRef.current = false;
      }}
      onEnd={() => {
        isUserDraggingRef.current = false;
      }}
    />
  );
};
