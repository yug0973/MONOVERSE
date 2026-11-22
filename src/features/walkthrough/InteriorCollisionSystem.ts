import * as THREE from 'three';

export interface WallAABB {
  min: [number, number, number];
  max: [number, number, number];
}

/**
 * 11 Primary Structural Dividing Walls of Residence 12-A
 * Doorway openings are cleanly preserved so navigation is 100% fluid and natural:
 * - Master Bedroom doorway: Z in [-7.8, -6.5] at X = -6.8
 * - Family Lounge archway: Z in [-8.0, -6.4]
 * - Living & Dining threshold: Z in [-7.8, -6.3] at X = 2.8
 * - Kitchen passage: X in [3.0, 4.2] at Z = -6.4
 * - Foyer Gallery archway: X in [-1.8, 1.7] at Z in [-7.0, -6.0]
 */
export const STRUCTURAL_DIVIDING_WALLS: WallAABB[] = [
  // 1. West Master Suite Spine Wall (between Master Suite and Family Lounge)
  { min: [-6.95, 0, -14.0], max: [-6.65, 3.5, -7.8] },

  // 2. Master Suite South Wall (bathroom / closet dividing partition)
  { min: [-12.0, 0, -6.45], max: [-7.5, 3.5, -6.20] },

  // 3. Bedroom 2 East Wall (separating Bedroom 2 from Family Lounge)
  { min: [-3.05, 0, -15.5], max: [-2.80, 3.5, -8.1] },

  // 4. Living / Lounge Spine Wall (separating Living Room from Family Lounge)
  { min: [2.70, 0, -15.5], max: [2.95, 3.5, -7.8] },

  // 5. Kitchen dividing wall from foyer/gallery
  { min: [4.20, 0, -6.20], max: [4.40, 3.5, -0.65] },

  // 6. Foyer East closet wall
  { min: [1.70, 0, -6.20], max: [1.95, 3.5, -3.70] },

  // 7. Foyer West powder room wall
  { min: [-2.05, 0, -6.20], max: [-1.80, 3.5, -3.70] },

  // 8. Exterior East perimeter wall
  { min: [11.9, 0, -17.5], max: [12.4, 3.5, -0.2] },

  // 9. Exterior West perimeter wall
  { min: [-12.4, 0, -17.5], max: [-11.9, 3.5, -0.2] },

  // 10. Exterior South entrance wall
  { min: [-12.4, 0, -0.3], max: [12.4, 3.5, 0.2] },

  // 11. Terrace North balustrade
  { min: [-12.4, 0, -17.5], max: [12.4, 3.5, -17.1] },
];

export class InteriorCollisionSystem {
  private static instance: InteriorCollisionSystem;

  public walls: WallAABB[] = STRUCTURAL_DIVIDING_WALLS;

  private constructor() {}

  public static getInstance(): InteriorCollisionSystem {
    if (!InteriorCollisionSystem.instance) {
      InteriorCollisionSystem.instance = new InteriorCollisionSystem();
    }
    return InteriorCollisionSystem.instance;
  }

  /**
   * Check if a 2D position with a given capsule radius collides with any structural wall
   */
  public isColliding(x: number, z: number, radius = 0.14): boolean {
    for (const w of this.walls) {
      if (
        x + radius > w.min[0] &&
        x - radius < w.max[0] &&
        z + radius > w.min[2] &&
        z - radius < w.max[2]
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Resolve player movement with axis-separated wall sliding (Unreal / Matterport style)
   * Prevents clipping through walls while allowing silky-smooth sliding along surfaces and doorways
   */
  public resolveWalkMovement(
    currentPos: THREE.Vector3,
    deltaMove: THREE.Vector3,
    radius = 0.14
  ): THREE.Vector3 {
    let nextX = currentPos.x;
    let nextZ = currentPos.z;

    // 1. Try X axis movement independently
    if (Math.abs(deltaMove.x) > 0.00001) {
      const candX = currentPos.x + deltaMove.x;
      if (!this.isColliding(candX, currentPos.z, radius) && candX >= -11.8 && candX <= 11.8) {
        nextX = candX;
      }
    }

    // 2. Try Z axis movement independently (allows smooth wall sliding!)
    if (Math.abs(deltaMove.z) > 0.00001) {
      const candZ = currentPos.z + deltaMove.z;
      if (!this.isColliding(nextX, candZ, radius) && candZ >= -17.0 && candZ <= -0.4) {
        nextZ = candZ;
      } else if (!this.isColliding(currentPos.x, candZ, radius) && candZ >= -17.0 && candZ <= -0.4) {
        // Corner-nudge: if compound (nextX, candZ) caught a doorpost, allow pure Z slide
        nextX = currentPos.x;
        nextZ = candZ;
      }
    }

    return new THREE.Vector3(nextX, 1.60, nextZ);
  }

  /**
   * Get the active room ID based on player's current (x, z) coordinates
   */
  public getRoomAtPosition(x: number, z: number): string {
    // 1. East & West Terraces / Panoramic Sundeck Balconies
    if (z <= -13.8) {
      return 'balcony';
    }
    // 2. Master Bedroom Suite (West rear wing)
    if (x <= -6.7 && z >= -13.8 && z <= -6.3) {
      return 'master_bedroom';
    }
    // 3. Junior Suite / Bedroom 2 (West front-mid wing)
    if (x >= -6.7 && x <= -2.8 && z >= -13.8 && z <= -7.5) {
      return 'bedroom_2';
    }
    // 4. Family Lounge & Library / Bedroom 3 (Center rear lounge)
    if (x >= -2.8 && x <= 2.8 && z >= -14.0 && z <= -7.5) {
      return 'bedroom_3';
    }
    // 5. Grand Living & Dining (East rear & center hall)
    if (x >= 2.8 && z >= -13.8 && z <= -6.2) {
      return 'living_dining';
    }
    // 6. Show & Wet Kitchen with Pantry (East front wing)
    if (x >= 3.5 && z >= -6.2 && z <= -0.5) {
      return 'kitchen';
    }
    // 7. Front Foyer & Elevator Vestibule (Center entrance)
    if (x >= -3.5 && x <= 3.5 && z >= -7.5 && z <= 0.0) {
      return 'foyer';
    }
    // Fallback: nearest entrance foyer
    return 'foyer';
  }
}
