import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useTexture, Sky } from '@react-three/drei';
import { Sky as SkyShaderMesh } from 'three/examples/jsm/objects/Sky.js';
import { useAppStore } from '../../store/useAppStore';
import { TIME_OF_DAY_PRESETS } from '../../data/customizerPalettes';
import { TimeOfDay } from '../../types/customizer';

const DUSK_PANORAMA_URL = '/textures/environment/pano_vadodara_dusk_sky_360_v1.png';

type Vec3 = [number, number, number];

interface SkyParams {
  sun: Vec3;
  turbidity: number;
  rayleigh: number;
  mie: number;
  mieG: number;
}

/**
 * Procedural physical sky per time of day. Day and walkthrough views use it as the visible backdrop,
 * and day views also bake it into the image-based lighting (see useProceduralEnvironment).
 * The sun direction here is the same direction used for the directional light below, so the sky,
 * the shadows and the reflections always agree.
 */
const SKY_PARAMS: Record<TimeOfDay, SkyParams> = {
  morning: { sun: [32, 32, 28], turbidity: 4, rayleigh: 0.35, mie: 0.005, mieG: 0.82 },
  noon: { sun: [25, 46, 36], turbidity: 3.5, rayleigh: 0.25, mie: 0.004, mieG: 0.85 },
  golden_hour: { sun: [-46, 8, 24], turbidity: 12, rayleigh: 3.8, mie: 0.02, mieG: 0.82 },
  night: { sun: [-28, -25, -26], turbidity: 20, rayleigh: 0.15, mie: 0.005, mieG: 0.82 },
};

/**
 * Seen from inside a flat, the sky fills a whole wall of glass. The saturated sunset sky that looks right
 * on the exterior turns the room into an orange haze, so the interior sunset sky is calmer.
 */
const INTERIOR_SKY_OVERRIDE: Partial<Record<TimeOfDay, Partial<SkyParams>>> = {
  golden_hour: { turbidity: 8, rayleigh: 2.1, mie: 0.012 },
};

/** Directional light direction. The night entry is moonlight, so it differs from the (below-horizon) sky sun. */
const LIGHT_POSITION: Record<TimeOfDay, Vec3> = {
  morning: [32, 32, 28],
  noon: [25, 46, 36],
  golden_hour: [-46, 10, 24],
  night: [-28, 42, -26],
};

const LIGHT_COLOR: Record<TimeOfDay, string | null> = {
  morning: null, // use the preset colour
  noon: null,
  golden_hour: '#FF9C50',
  night: '#5078A8',
};

const LIGHT_INTENSITY: Record<TimeOfDay, number> = {
  morning: 2.0,
  noon: 2.2,
  golden_hour: 1.8,
  night: 0.45,
};

/**
 * Image-based lighting strength. Exterior surfaces see the full sky. Inside a flat, the sky reaches
 * every surface equally because there is no occlusion, so it is kept low and the room relies on its
 * own fixtures for the light that gives it depth.
 */
const ENV_INTENSITY_EXTERIOR: Record<TimeOfDay, number> = {
  morning: 0.9,
  noon: 1.0,
  golden_hour: 1.0,
  night: 0.35,
};

const ENV_INTENSITY_INTERIOR: Record<TimeOfDay, number> = {
  morning: 0.35,
  noon: 0.4,
  golden_hour: 0.3,
  night: 0.12,
};

/** Backdrop brightness for the dusk panorama. At night the same photo is pulled down to a deep twilight. */
const BACKGROUND_INTENSITY: Record<TimeOfDay, number> = {
  morning: 1,
  noon: 1,
  golden_hour: 1,
  night: 0.3,
};

/** Ambient sky/ground fill. Reduced from before because the environment map now supplies most of it. */
const HEMI_INTENSITY: Record<TimeOfDay, number> = {
  morning: 0.35,
  noon: 0.4,
  golden_hour: 0.3,
  night: 0.2,
};

const HEMI_SKY_COLOR: Record<TimeOfDay, string> = {
  morning: '#88B8E8',
  noon: '#88B8E8',
  golden_hour: '#3B4E6B',
  night: '#101B2E',
};

const HEMI_GROUND_COLOR: Record<TimeOfDay, string> = {
  morning: '#4A4035',
  noon: '#4A4035',
  golden_hour: '#2A221A',
  night: '#0A0F18',
};

/** Entrance, canopy and crown fixtures are practical lights: nearly off in daylight, full at dusk, boosted at night. */
const PRACTICAL_LIGHT_FACTOR: Record<TimeOfDay, number> = {
  morning: 0.08,
  noon: 0.04,
  golden_hour: 1,
  night: 1.4,
};

const resolveSky = (time: TimeOfDay, interior: boolean): SkyParams => {
  const base = SKY_PARAMS[time];
  return interior ? { ...base, ...INTERIOR_SKY_OVERRIDE[time] } : base;
};

/**
 * Bakes the procedural sky into a prefiltered environment map used for reflections and ambient light.
 * Runs only when the time of day changes (not per frame) and disposes the previous map, so there is no
 * GPU memory growth when toggling between Day, Sunset and Night.
 */
const useProceduralEnvironment = (enabled: boolean, time: TimeOfDay, interior: boolean): THREE.Texture | null => {
  const gl = useThree((s) => s.gl);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!enabled) {
      setTexture(null);
      return;
    }

    const params = resolveSky(time, interior);
    const skyScene = new THREE.Scene();
    const sky = new SkyShaderMesh();
    sky.scale.setScalar(10000);
    const u = (sky.material as THREE.ShaderMaterial).uniforms;
    u.turbidity.value = params.turbidity;
    u.rayleigh.value = params.rayleigh;
    u.mieCoefficient.value = params.mie;
    u.mieDirectionalG.value = params.mieG;
    u.sunPosition.value.set(...params.sun);
    skyScene.add(sky);

    const pmrem = new THREE.PMREMGenerator(gl);
    const renderTarget = pmrem.fromScene(skyScene, 0.02);
    pmrem.dispose();
    sky.geometry.dispose();
    sky.material.dispose();
    setTexture(renderTarget.texture);

    return () => {
      renderTarget.dispose();
    };
  }, [enabled, time, interior, gl]);

  return texture;
};

export const LightingRig: React.FC = () => {
  const customization = useAppStore((s) => s.customization);
  const viewMode = useAppStore((s) => s.viewMode);
  const debugMode = useAppStore((s) => s.debugMode);
  const isLiteQuality = useAppStore((s) => s.isLiteQuality);
  const scene = useThree((s) => s.scene);

  const time = customization.timeOfDay;
  const preset = TIME_OF_DAY_PRESETS[time] || TIME_OF_DAY_PRESETS.golden_hour;

  const isWalkthroughLike = viewMode === 'walkthrough' || viewMode === 'foyer_entry';
  const isInsideFlat = isWalkthroughLike || viewMode === 'dollhouse';
  const usesDuskPanorama = !isInsideFlat && (time === 'golden_hour' || time === 'night');
  const usesProceduralSky = isWalkthroughLike || (!isInsideFlat && !usesDuskPanorama);

  const duskPanorama = useTexture(DUSK_PANORAMA_URL);
  const skyEnvironment = useProceduralEnvironment(!usesDuskPanorama, time, isInsideFlat);

  // Configure the panorama once. Colour space and mapping are required for correct reflections.
  useEffect(() => {
    duskPanorama.mapping = THREE.EquirectangularReflectionMapping;
    duskPanorama.colorSpace = THREE.SRGBColorSpace;
    duskPanorama.needsUpdate = true;
  }, [duskPanorama]);

  // Environment (lighting + reflections) and visible background for the current view.
  useEffect(() => {
    scene.environment = usesDuskPanorama ? duskPanorama : skyEnvironment;
    scene.environmentIntensity = (isInsideFlat ? ENV_INTENSITY_INTERIOR : ENV_INTENSITY_EXTERIOR)[time];

    if (usesProceduralSky) {
      // The drei <Sky /> dome below is the backdrop.
      scene.background = null;
    } else if (usesDuskPanorama) {
      scene.background = debugMode === 'clay' ? new THREE.Color('#E8E3DA') : duskPanorama;
      scene.backgroundIntensity = BACKGROUND_INTENSITY[time];
    }
    // Dollhouse: SceneCanvas owns the studio background colour, so it is left alone here.
  }, [
    scene,
    time,
    isInsideFlat,
    usesDuskPanorama,
    usesProceduralSky,
    duskPanorama,
    skyEnvironment,
    debugMode,
  ]);

  const sky = resolveSky(time, isInsideFlat);
  const lightPosition = LIGHT_POSITION[time];
  const lightColor = LIGHT_COLOR[time] ?? preset.sunColor;
  const practical = PRACTICAL_LIGHT_FACTOR[time];

  return (
    <group>
      {usesProceduralSky && (
        <Sky
          distance={450000}
          sunPosition={sky.sun}
          turbidity={sky.turbidity}
          rayleigh={sky.rayleigh}
          mieCoefficient={sky.mie}
          mieDirectionalG={sky.mieG}
        />
      )}

      {/* 1. Ambient fill (the environment map carries most of the ambient light) */}
      <hemisphereLight args={[HEMI_SKY_COLOR[time], HEMI_GROUND_COLOR[time], HEMI_INTENSITY[time]]} />

      {/* 2. Primary sun / moon light with soft shadows (exterior and dollhouse only) */}
      <directionalLight
        position={lightPosition}
        color={lightColor}
        intensity={LIGHT_INTENSITY[time]}
        castShadow={!isLiteQuality && viewMode !== 'walkthrough'}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={4}
        shadow-camera-far={135}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={75}
        shadow-camera-bottom={-4}
        shadow-bias={-0.00012}
        shadow-normalBias={0.02}
      />

      {/* 3. Cool counter-fill so shadow sides keep colour and form instead of going black */}
      <directionalLight
        position={[-lightPosition[0] * 0.75, 35, -lightPosition[2] * 0.75]}
        color={time === 'night' ? '#1E3252' : '#284065'}
        intensity={time === 'night' ? 0.22 : 0.3}
      />

      {/* 4. Architectural practical lights: entrance canopy, lobby, base uplights, crown */}
      {!isInsideFlat && (
        <group>
          <pointLight position={[0, 4.6, 11.2]} color="#FFE0A4" intensity={3.8 * practical} distance={26} decay={2} />
          <pointLight position={[-8.5, 3.2, 11.5]} color="#FFD590" intensity={2.4 * practical} distance={18} decay={2} />
          <pointLight position={[8.5, 3.2, 11.5]} color="#FFD590" intensity={2.4 * practical} distance={18} decay={2} />
          <pointLight position={[-13.5, 2.5, 0]} color="#FFE5B0" intensity={2.0 * practical} distance={16} decay={2} />
          <pointLight position={[13.5, 2.5, 0]} color="#FFE5B0" intensity={2.0 * practical} distance={16} decay={2} />
          <pointLight position={[0, 52.0, 0]} color="#FFE8B5" intensity={2.8 * practical} distance={30} decay={2} />
        </group>
      )}
    </group>
  );
};

useTexture.preload(DUSK_PANORAMA_URL);
