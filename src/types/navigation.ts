export type ViewMode =
  | 'landing'
  | 'building'
  | 'floor_slice'
  | 'flat_flyin'
  | 'panorama'
  | 'dollhouse'
  | 'walkthrough';

export type QualityTier = 'high' | 'lite';

export type DebugRenderMode = 'textured' | 'clay' | 'wireframe';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}
