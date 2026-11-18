export type FlatType = '2BHK' | '3BHK' | '3BHK_PREMIUM';

export type FacingDirection = 'EAST' | 'WEST';

export type FlatStatus = 'AVAILABLE' | 'HELD' | 'SOLD';

export type FlatUnit = 'A' | 'B' | 'C' | 'D';

export interface RoomGeometry {
  id: string;
  name: string;
  areaSqFt: number;
  dimensionsMeters: {
    width: number;
    length: number;
    height: number;
  };
  position: [number, number, number]; // [x, y, z] relative to flat center
  walkthroughHotspot: [number, number, number]; // [x, 1.6, z] eye height
  hotspotLookAt: [number, number, number];
}

export interface FlatData {
  id: string; // e.g. "flat-12-b"
  code: string; // e.g. "1202"
  floorNumber: number; // 1 to 14
  unitNumber: FlatUnit;
  type: FlatType;
  carpetAreaSqFt: number; // 1150 | 1650 | 1950
  balconyAreaSqFt: number;
  facing: FacingDirection;
  status: FlatStatus;
  basePrice: number; // Base price in INR without floor rise
  floorRiseRatePerSqFt: number; // Incremental INR per sq ft per floor
  totalPrice: number; // Calculated price in INR
  rooms: RoomGeometry[];
}

export interface FloorData {
  floorNumber: number;
  title: string;
  elevationMeters: number; // e.g. floorNumber * 3.3
  flats: FlatData[];
  isAmenityFloor?: boolean;
}

export interface Landmark {
  name: string;
  category: 'transit' | 'education' | 'healthcare' | 'commercial';
  distanceKm: number;
  driveTimeMin: number;
}

export interface Amenity {
  id: string;
  title: string;
  category: 'wellness' | 'leisure' | 'community' | 'convenience';
  description: string;
  location: string;
  iconName: string;
}

export interface ProjectMetadata {
  name: string;
  tagline: string;
  city: string;
  state: string;
  locationNeighborhood: string;
  reraNumber: string;
  possessionDate: string;
  totalFloors: number;
  flatsPerFloor: number;
  totalUnits: number;
  amenities: Amenity[];
  landmarks: Landmark[];
}
