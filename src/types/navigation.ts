export type ViewMode =
  | 'landing'
  | 'building'
  | 'floor_slice'
  | 'dollhouse'
  | 'walkthrough';

export type QualityTier = 'high' | 'lite';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}
