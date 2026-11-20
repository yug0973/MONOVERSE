import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { EXPERIENCE_CONFIG } from '../../config/experience.config';

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
  const hasTriggeredDissolveRef = useRef<boolean>(false);
  const flightTimeRef = useRef<number>(0);

  // Walkthrough yaw & pitch tracking
  const yawRef = useRef<number>(Math.PI);
  const pitchRef = useRef<number>(0);
  const isDraggingWalkthroughRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Panorama look tracking (Module 4)
  // Initial orientation: facing the balcony window at yaw = +3.6 deg, pitch = -3.0 deg
  const panoramaYawRef = useRef<number>((3.6 * Math.PI) / 180);
  const panoramaPitchRef = useRef<number>((-3.0 * Math.PI) / 180);
  const isDraggingPanoramaRef = useRef<boolean>(false);

  const prevViewModeRef = useRef<string>(viewMode);
  const prevFloorRef = useRef<number | null>(selectedFloorNumber);
  const prevFlatRef = useRef<string | null>(selectedFlatId);

  // Dynamic Camera FOV adjustment: 70° in panorama (Module 4), 60° in walkthrough, 30° in building
  useEffect(() => {
    const perspCamera = camera as THREE.PerspectiveCamera;
    const targetFov =
      viewMode === 'panorama'
        ? EXPERIENCE_CONFIG.panoramaSettings.defaultFov
        : viewMode === 'walkthrough'
        ? 60
        : 30; // 35mm-equivalent FOV 28-32 for exterior

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

  // Hotspot click listener in panorama mode: smoothly turns camera to look at the clicked hotspot
  useEffect(() => {
    const handleHotspotSelect = (e: any) => {
      const hs = e.detail;
      if (hs && viewMode === 'panorama') {
        const yawDeg = (hs.xPercent / 100 - 0.5) * 360;
        const pitchDeg = (0.5 - hs.yPercent / 100) * 180;
        panoramaYawRef.current = (yawDeg * Math.PI) / 180;
        panoramaPitchRef.current = (pitchDeg * Math.PI) / 180;
      }
    };

    window.addEventListener('panorama-hotspot-select', handleHotspotSelect);
    return () => window.removeEventListener('panorama-hotspot-select', handleHotspotSelect);
  }, [viewMode]);

  // Whenever viewMode, floor, or flat changes, trigger a smooth transition
  useEffect(() => {
    isTransitioningRef.current = true;
    hasTriggeredDissolveRef.current = false;

    if (viewMode === 'landing') {
      vLookAt.set(-6.0, 26.0, 0);
      vTarget.set(40, 20.0, 56);
    } else if (viewMode === 'building') {
      vLookAt.set(0, 26.0, 0);
      const distFromCenter = Math.hypot(camera.position.x, camera.position.z);
      if (distFromCenter < 35 || camera.position.y > 65 || camera.position.y < 10) {
        vTarget.set(46, 24.0, 52);
      } else {
        vTarget.copy(camera.position);
      }
    } else if (viewMode === 'dollhouse') {
      vLookAt.set(0, 0.5, -6.0);
      vTarget.set(0, 15.5, 7.5);
    } else if (viewMode === 'floor_slice') {
      const floorElevation = 6.0 + ((selectedFloorNumber || 1) - 1) * 3.0;
      vLookAt.set(0, floorElevation + 1.5, 0);
      const angle = controlsRef.current ? controlsRef.current.getAzimuthalAngle() : 0.75;
      vTarget.set(Math.sin(angle) * 36, floorElevation + 9.5, Math.cos(angle) * 36);
    } else if (viewMode === 'flat_flyin') {
      flightTimeRef.current = 0;
      // Approach balcony window of the selected flat (Module 4)
      const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;
      const unit = (flat?.unitNumber || 'A') as 'A' | 'B' | 'C' | 'D';
      const floorNum = flat?.floorNumber || selectedFloorNumber || 12;
      const floorElevation = 6.0 + (floorNum - 1) * 3.0;

      const targetConfig =
        EXPERIENCE_CONFIG.balconyTargets[unit] || EXPERIENCE_CONFIG.balconyTargets.A;

      vLookAt.set(
        targetConfig.approachLookAtOffset[0],
        floorElevation + targetConfig.approachLookAtOffset[1],
        targetConfig.approachLookAtOffset[2]
      );
      vTarget.set(
        targetConfig.approachCameraOffset[0],
        floorElevation + targetConfig.approachCameraOffset[1],
        targetConfig.approachCameraOffset[2]
      );
    } else if (viewMode === 'panorama') {
      vTarget.set(0, 1.6, 0);
      camera.position.set(0, 1.6, 0);
      panoramaYawRef.current = (3.6 * Math.PI) / 180;
      panoramaPitchRef.current = (-3.0 * Math.PI) / 180;
    }

    prevViewModeRef.current = viewMode;
    prevFloorRef.current = selectedFloorNumber;
    prevFlatRef.current = selectedFlatId;
  }, [viewMode, selectedFloorNumber, selectedFlatId, camera]);

  // Pointer listeners for walkthrough and panorama look-around
  useEffect(() => {
    const domElement = gl.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      if (viewMode === 'walkthrough') {
        isDraggingWalkthroughRef.current = true;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };
        try {
          domElement.setPointerCapture(e.pointerId);
        } catch (_) {}
      } else if (viewMode === 'panorama') {
        isDraggingPanoramaRef.current = true;
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

        yawRef.current -= dx * 0.0035;
        pitchRef.current -= dy * 0.0028;
        pitchRef.current = Math.max(-0.65, Math.min(0.65, pitchRef.current));
      } else if (isDraggingPanoramaRef.current && viewMode === 'panorama') {
        const dx = e.clientX - prevPointerRef.current.x;
        const dy = e.clientY - prevPointerRef.current.y;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };

        const sensitivity = 0.0035;
        let newYaw = panoramaYawRef.current + dx * sensitivity;
        let newPitch = panoramaPitchRef.current + dy * sensitivity;

        // Pitch clamp: -55° to +55°
        const maxPitch = (55 * Math.PI) / 180;
        newPitch = Math.max(-maxPitch, Math.min(maxPitch, newPitch));

        // Yaw clamp: +/- 150° around start view (+3.6°) to hide 0%/100% seam (Module 4 Spec)
        if (EXPERIENCE_CONFIG.panoramaSettings.enableYawLimit) {
          const startYaw = (3.6 * Math.PI) / 180;
          const maxYawDelta =
            (EXPERIENCE_CONFIG.panoramaSettings.yawRangeDegrees * Math.PI) / 180;
          newYaw = Math.max(startYaw - maxYawDelta, Math.min(startYaw + maxYawDelta, newYaw));
        }

        panoramaYawRef.current = newYaw;
        panoramaPitchRef.current = newPitch;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDraggingWalkthroughRef.current) {
        isDraggingWalkthroughRef.current = false;
        try {
          domElement.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
      if (isDraggingPanoramaRef.current) {
        isDraggingPanoramaRef.current = false;
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
      const driftAngle = Math.sin(timeRef.current * 0.08) * 0.04;
      const cx = 34 + Math.sin(driftAngle) * 2.5;
      const cz = 48 + Math.cos(driftAngle) * 2.5;
      const cy = 13.5 + Math.sin(timeRef.current * 0.06) * 0.5;

      vTarget.set(cx, cy, cz);
      vLookAt.set(-9.5, 22.0, 0);

      const lerpSpeed = prefersReducedMotion ? 1.0 : Math.min(delta * 2.5, 0.1);
      camera.position.lerp(vTarget, lerpSpeed);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(vLookAt, lerpSpeed);
        controlsRef.current.update();
      }
      return;
    }

    if (viewMode === 'flat_flyin') {
      flightTimeRef.current += delta;
      // Eased camera flight to flat's balcony window (Module 4)
      const lerpSpeed = prefersReducedMotion ? 1.0 : Math.min(delta * 3.5, 0.18);
      camera.position.lerp(vTarget, lerpSpeed);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(vLookAt, lerpSpeed);
        controlsRef.current.update();
      }

      // Check distance to balcony target or flight duration (~1.4s)
      const dist = camera.position.distanceTo(vTarget);
      if ((dist < 2.5 || flightTimeRef.current >= 1.4) && !hasTriggeredDissolveRef.current) {
        hasTriggeredDissolveRef.current = true;
        // Hold briefly at balcony window, then trigger 800ms warm mask crossfade
        setTimeout(() => {
          useAppStore.getState().setDissolvingWarmMask(true);
          setTimeout(() => {
            useAppStore.getState().enterPanorama();
            setTimeout(() => {
              useAppStore.getState().setDissolvingWarmMask(false);
              hasTriggeredDissolveRef.current = false;
            }, 400);
          }, 400);
        }, 350);
      }
      return;
    }

    if (viewMode === 'panorama') {
      camera.position.set(0, 1.6, 0);
      const lookDist = 20;
      const yaw = panoramaYawRef.current;
      const pitch = panoramaPitchRef.current;

      // Inverted spherical look mapping matching equirectangular sphere
      const lx = -Math.sin(yaw) * Math.cos(pitch) * lookDist;
      const ly = Math.sin(pitch) * lookDist;
      const lz = Math.cos(yaw) * Math.cos(pitch) * lookDist;

      vLookAt.set(lx, 1.6 + ly, lz);
      camera.lookAt(vLookAt);
      return;
    }

    if (viewMode === 'walkthrough') {
      const targetX = activeHotspot ? activeHotspot[0] : 6.2;
      const targetY = 1.6;
      const targetZ = activeHotspot ? activeHotspot[2] : -7.5;

      vTarget.set(targetX, targetY, targetZ);
      if (camera.position.distanceTo(vTarget) > 0.01) {
        camera.position.lerp(vTarget, Math.min(delta * 5.0, 0.3));
      }

      const lookDist = 10;
      const lx = camera.position.x + Math.sin(yawRef.current) * Math.cos(pitchRef.current) * lookDist;
      const ly = camera.position.y + Math.sin(pitchRef.current) * lookDist;
      const lz = camera.position.z + Math.cos(yawRef.current) * Math.cos(pitchRef.current) * lookDist;

      vLookAt.set(lx, ly, lz);
      camera.lookAt(vLookAt);
      return;
    }

    // In building or floor_slice mode:
    if (isTransitioningRef.current && !isUserDraggingRef.current) {
      const lerpSpeed = prefersReducedMotion ? 1.0 : Math.min(delta * 3.2, 0.15);
      camera.position.lerp(vTarget, lerpSpeed);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(vLookAt, lerpSpeed);
      }

      const dist = camera.position.distanceTo(vTarget);
      if (dist < 0.25) {
        isTransitioningRef.current = false;
      }
    }

    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  const isExterior =
    viewMode === 'landing' || viewMode === 'building' || viewMode === 'floor_slice';
  const minCamDist = isExterior ? 22 : 6;
  const maxCamDist = isExterior ? 95 : 60;

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.09}
      rotateSpeed={0.8}
      zoomSpeed={0.95}
      panSpeed={0.8}
      minDistance={minCamDist}
      maxDistance={maxCamDist}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minPolarAngle={Math.PI / 16}
      enabled={viewMode !== 'walkthrough' && viewMode !== 'panorama' && viewMode !== 'flat_flyin'}
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
