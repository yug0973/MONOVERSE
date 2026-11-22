import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { EXPERIENCE_CONFIG } from '../../config/experience.config';
import { InteriorCollisionSystem } from '../../features/walkthrough/InteriorCollisionSystem';

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

  // Keyboard navigation state for WASD / Arrow walking
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const velocityRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Panorama look tracking (Module 4)
  const panoramaYawRef = useRef<number>((3.6 * Math.PI) / 180);
  const panoramaPitchRef = useRef<number>((-3.0 * Math.PI) / 180);
  const isDraggingPanoramaRef = useRef<boolean>(false);

  const prevViewModeRef = useRef<string>(viewMode);
  const prevFloorRef = useRef<number | null>(selectedFloorNumber);
  const prevFlatRef = useRef<string | null>(selectedFlatId);

  // Global Keyboard listener for first-person WASD walking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not capture keys when typing in input/textarea modals
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      keysPressedRef.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Dynamic Camera FOV adjustment: 70° in panorama, 60° in walkthrough/foyer, 30° in building
  useEffect(() => {
    const perspCamera = camera as THREE.PerspectiveCamera;
    const targetFov =
      viewMode === 'panorama'
        ? EXPERIENCE_CONFIG.panoramaSettings.defaultFov
        : viewMode === 'walkthrough' || viewMode === 'foyer_entry'
          ? 60
          : 44; // Full-height view showing entire G+9 tower with crown and street without vertical clipping

    if (perspCamera.fov !== targetFov) {
      perspCamera.fov = targetFov;
      perspCamera.updateProjectionMatrix();
    }
  }, [viewMode, camera]);

  // Track whether room change was triggered by player walking vs user clicking a room button
  const isWalkingRef = useRef<boolean>(false);

  // Handle activeRoomId initial orientation in walkthrough ONLY on explicit mode switch or programmatic room selection
  useEffect(() => {
    if (viewMode === 'walkthrough') {
      // If the player is actively walking or looking around, NEVER snap their camera angle!
      if (isWalkingRef.current) {
        return;
      }

      const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;
      const room = flat?.rooms.find((r) => r.id === activeRoomId);
      if (room) {
        const [hx, hy, hz] = room.walkthroughHotspot;
        
        // Only set position on entry or when coming from outside walkthrough
        if (prevViewModeRef.current !== 'walkthrough') {
          camera.position.set(hx, 1.60, hz);
          const dx = room.hotspotLookAt[0] - hx;
          const dy = room.hotspotLookAt[1] - hy;
          const dz = room.hotspotLookAt[2] - hz;
          yawRef.current = Math.atan2(dx, dz);
          pitchRef.current = Math.atan2(dy, Math.hypot(dx, dz));
        }
      }
    }
  }, [viewMode, selectedFlatId, camera]);

  // Hotspot click listener in panorama mode
  useEffect(() => {
    const handleHotspotSelect = (e: any) => {
      const hs = e.detail;
      if (hs && viewMode === 'panorama') {
        if (hs.targetRoomId && hs.targetRoomId !== 'living') {
          useAppStore.getState().switchTourRoom(hs.targetRoomId);
        } else {
          const yawDeg = (hs.xPercent / 100 - 0.5) * 360;
          const pitchDeg = (0.5 - hs.yPercent / 100) * 180;
          panoramaYawRef.current = (yawDeg * Math.PI) / 180;
          panoramaPitchRef.current = (pitchDeg * Math.PI) / 180;
        }
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
      vLookAt.set(0.5, 17.0, 2.0);
      vTarget.set(30.0, 17.5, 70.0);
    } else if (viewMode === 'building') {
      vLookAt.set(0.5, 17.0, 2.0);
      const distFromCenter = Math.hypot(camera.position.x, camera.position.z);
      if (distFromCenter < 25 || camera.position.y > 55 || camera.position.y < 8) {
        vTarget.set(30.0, 17.5, 70.0);
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
    } else if (viewMode === 'foyer_entry') {
      flightTimeRef.current = 0;
      const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;
      const unit = (flat?.unitNumber || 'A') as 'A' | 'B' | 'C' | 'D';
      const floorNum = flat?.floorNumber || selectedFloorNumber || 12;
      const floorElevation = 6.0 + (floorNum - 1) * 3.0;

      // Start vantage point outside the building quadrant corresponding to selected unit
      let startX = 20.0;
      let startZ = 22.0;
      if (unit === 'B') { startX = 20.0; startZ = -22.0; }
      else if (unit === 'C') { startX = -20.0; startZ = -22.0; }
      else if (unit === 'D') { startX = -20.0; startZ = 22.0; }

      if (prevViewModeRef.current !== 'foyer_entry') {
        camera.position.set(startX, floorElevation + 4.5, startZ);
      }

      // Approach target: Entrance doorway into Front Foyer
      vTarget.set(0.0, 1.60, -1.20);
      vLookAt.set(0.0, 1.60, -8.00);
      yawRef.current = Math.PI;
      pitchRef.current = 0;
    } else if (viewMode === 'flat_flyin') {
      flightTimeRef.current = 0;
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
      if (prevViewModeRef.current !== 'panorama') {
        panoramaYawRef.current = (3.6 * Math.PI) / 180;
        panoramaPitchRef.current = (-3.0 * Math.PI) / 180;
      }
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
      } else if (viewMode === 'panorama') {
        isDraggingPanoramaRef.current = true;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };
        try {
          domElement.setPointerCapture(e.pointerId);
        } catch (_) { }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingWalkthroughRef.current && viewMode === 'walkthrough') {
        const dx = e.clientX - prevPointerRef.current.x;
        const dy = e.clientY - prevPointerRef.current.y;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };

        yawRef.current -= dx * 0.0035;
        pitchRef.current -= dy * 0.0028;
        // Pitch clamp: -70° to +70° for natural architectural inspection
        pitchRef.current = Math.max(-1.22, Math.min(1.22, pitchRef.current));
      } else if (isDraggingPanoramaRef.current && viewMode === 'panorama') {
        const dx = e.clientX - prevPointerRef.current.x;
        const dy = e.clientY - prevPointerRef.current.y;
        prevPointerRef.current = { x: e.clientX, y: e.clientY };

        const sensitivity = 0.0035;
        let newYaw = panoramaYawRef.current + dx * sensitivity;
        let newPitch = panoramaPitchRef.current + dy * sensitivity;

        const maxPitch = (55 * Math.PI) / 180;
        newPitch = Math.max(-maxPitch, Math.min(maxPitch, newPitch));

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
      }
      if (isDraggingPanoramaRef.current) {
        isDraggingPanoramaRef.current = false;
        try {
          domElement.releasePointerCapture(e.pointerId);
        } catch (_) { }
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
      const driftAngle = Math.sin(timeRef.current * 0.04) * 0.02;
      const cx = 30.0 + Math.sin(driftAngle) * 1.5;
      const cz = 70.0 + Math.cos(driftAngle) * 1.5;
      const cy = 17.5 + Math.sin(timeRef.current * 0.03) * 0.3;

      vTarget.set(cx, cy, cz);
      vLookAt.set(0.5, 17.0, 2.0);

      const lerpSpeed = prefersReducedMotion ? 1.0 : Math.min(delta * 2.5, 0.1);
      camera.position.lerp(vTarget, lerpSpeed);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(vLookAt, lerpSpeed);
        controlsRef.current.update();
      }
      return;
    }

    if (viewMode === 'foyer_entry') {
      flightTimeRef.current += delta;
      const lerpSpeed = prefersReducedMotion ? 1.0 : Math.min(delta * 3.0, 0.14);
      camera.position.lerp(vTarget, lerpSpeed);

      // Look forward into the apartment foyer
      camera.lookAt(vLookAt);

      const dist = camera.position.distanceTo(vTarget);
      if (dist < 0.20 || flightTimeRef.current >= 1.4) {
        camera.position.set(0.0, 1.60, -1.50);
        yawRef.current = Math.PI;
        pitchRef.current = 0;
        useAppStore.getState().setViewMode('walkthrough');
      }
      return;
    }

    if (viewMode === 'flat_flyin') {
      flightTimeRef.current += delta;
      const lerpSpeed = prefersReducedMotion ? 1.0 : Math.min(delta * 3.5, 0.18);
      camera.position.lerp(vTarget, lerpSpeed);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(vLookAt, lerpSpeed);
        controlsRef.current.update();
      }

      const dist = camera.position.distanceTo(vTarget);
      if ((dist < 2.5 || flightTimeRef.current >= 1.4) && !hasTriggeredDissolveRef.current) {
        hasTriggeredDissolveRef.current = true;
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

      const lx = -Math.sin(yaw) * Math.cos(pitch) * lookDist;
      const ly = Math.sin(pitch) * lookDist;
      const lz = Math.cos(yaw) * Math.cos(pitch) * lookDist;

      vLookAt.set(lx, 1.6 + ly, lz);
      camera.lookAt(vLookAt);
      return;
    }

    if (viewMode === 'walkthrough') {
      const keys = keysPressedRef.current;
      const isMovingForward = keys['w'] || keys['arrowup'];
      const isMovingBackward = keys['s'] || keys['arrowdown'];
      const isStrafingLeft = keys['a'] || keys['arrowleft'];
      const isStrafingRight = keys['d'] || keys['arrowright'];

      // Forward and Right unit vectors relative to current camera yaw
      const forwardX = Math.sin(yawRef.current);
      const forwardZ = Math.cos(yawRef.current);
      const rightX = Math.cos(yawRef.current);
      const rightZ = -Math.sin(yawRef.current);

      let moveX = 0;
      let moveZ = 0;

      if (isMovingForward) { moveX += forwardX; moveZ += forwardZ; }
      if (isMovingBackward) { moveX -= forwardX; moveZ -= forwardZ; }
      if (isStrafingRight) { moveX += rightX; moveZ += rightZ; }
      if (isStrafingLeft) { moveX -= rightX; moveZ -= rightZ; }

      const inputLen = Math.hypot(moveX, moveZ);
      const maxWalkSpeed = 2.0; // 2.0 m/s architectural walking speed

      const targetVelX = inputLen > 0 ? (moveX / inputLen) * maxWalkSpeed : 0;
      const targetVelZ = inputLen > 0 ? (moveZ / inputLen) * maxWalkSpeed : 0;

      // Acceleration & deceleration friction
      const accelRate = inputLen > 0 ? 14.0 : 10.0;
      velocityRef.current.x += (targetVelX - velocityRef.current.x) * Math.min(delta * accelRate, 1.0);
      velocityRef.current.z += (targetVelZ - velocityRef.current.z) * Math.min(delta * accelRate, 1.0);

      // Cancel active glide if user starts pressing movement keys
      if (inputLen > 0 && activeHotspot) {
        useAppStore.setState({ activeHotspot: null });
      }

      // Track walking activity
      isWalkingRef.current = inputLen > 0 || Math.hypot(velocityRef.current.x, velocityRef.current.z) > 0.001;

      // Smooth click-to-walk gliding (Matterport style)
      if (activeHotspot && inputLen === 0) {
        vTarget.set(activeHotspot[0], 1.60, activeHotspot[2]);
        const dist = camera.position.distanceTo(vTarget);
        if (dist > 0.05) {
          if (dist > 4.0) {
            // Far room switch (handled under warm dissolve veil)
            camera.position.set(activeHotspot[0], 1.60, activeHotspot[2]);
            const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;
            const room = flat?.rooms.find((r) => r.id === activeRoomId);
            if (room) {
              const dx = room.hotspotLookAt[0] - activeHotspot[0];
              const dy = room.hotspotLookAt[1] - 1.60;
              const dz = room.hotspotLookAt[2] - activeHotspot[2];
              yawRef.current = Math.atan2(dx, dz);
              pitchRef.current = Math.atan2(dy, Math.hypot(dx, dz));
            }
            useAppStore.setState({ activeHotspot: null });
          } else {
            // Natural smooth ease-out glide to target for nearby floor clicks
            camera.position.lerp(vTarget, Math.min(delta * 4.5, 0.22));
          }
        } else {
          camera.position.set(activeHotspot[0], 1.60, activeHotspot[2]);
          useAppStore.setState({ activeHotspot: null });
        }
      } else if (Math.hypot(velocityRef.current.x, velocityRef.current.z) > 0.001) {
        // Fluid architectural keyboard walking with axis-separated wall sliding (no clipping through walls)
        const deltaMove = new THREE.Vector3(
          velocityRef.current.x * delta,
          0,
          velocityRef.current.z * delta
        );
        const resolved = InteriorCollisionSystem.getInstance().resolveWalkMovement(
          camera.position,
          deltaMove,
          0.14
        );
        camera.position.set(resolved.x, 1.60, resolved.z);
      } else {
        camera.position.y = 1.60;
      }

      // Dynamic room detection as player walks
      const detectedRoomId = InteriorCollisionSystem.getInstance().getRoomAtPosition(
        camera.position.x,
        camera.position.z
      );
      if (detectedRoomId && detectedRoomId !== activeRoomId) {
        useAppStore.setState({ activeRoomId: detectedRoomId });
      }

      // Apply look orientation
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
  const minCamDist = isExterior ? 18 : 6;
  const maxCamDist = isExterior ? 110 : 60;

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
      enabled={
        viewMode !== 'walkthrough' &&
        viewMode !== 'foyer_entry' &&
        viewMode !== 'panorama' &&
        viewMode !== 'flat_flyin'
      }
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
