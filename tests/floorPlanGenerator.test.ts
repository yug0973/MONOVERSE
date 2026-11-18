import { describe, it, expect } from 'vitest';
import { BUILDING_FLOORS, ALL_FLATS, getFlatById } from '../src/data/buildingData';
import { PROJECT_DATA } from '../src/data/projectData';

describe('Tower & Floor Plan Generation Suite', () => {
  it('generates G+14 floors with 1 Ground and 14 residential floors', () => {
    expect(BUILDING_FLOORS.length).toBe(15);
    expect(BUILDING_FLOORS[0].isAmenityFloor).toBe(true);
    expect(BUILDING_FLOORS[0].floorNumber).toBe(0);

    const residentialFloors = BUILDING_FLOORS.slice(1);
    expect(residentialFloors.length).toBe(14);
    residentialFloors.forEach((floor, idx) => {
      expect(floor.floorNumber).toBe(idx + 1);
      expect(floor.flats.length).toBe(4);
    });
  });

  it('generates exactly 56 residential units', () => {
    expect(ALL_FLATS.length).toBe(56);
  });

  it('matches required status distribution: ~55% available, ~20% held, ~25% sold', () => {
    const available = ALL_FLATS.filter((f) => f.status === 'AVAILABLE').length;
    const held = ALL_FLATS.filter((f) => f.status === 'HELD').length;
    const sold = ALL_FLATS.filter((f) => f.status === 'SOLD').length;

    const availableRatio = available / ALL_FLATS.length;
    const heldRatio = held / ALL_FLATS.length;
    const soldRatio = sold / ALL_FLATS.length;

    expect(availableRatio).toBeGreaterThanOrEqual(0.50);
    expect(availableRatio).toBeLessThanOrEqual(0.60);

    expect(heldRatio).toBeGreaterThanOrEqual(0.18);
    expect(heldRatio).toBeLessThanOrEqual(0.24);

    expect(soldRatio).toBeGreaterThanOrEqual(0.22);
    expect(soldRatio).toBeLessThanOrEqual(0.28);
  });

  it('provides all 3 flat types with expected carpet areas', () => {
    const flat2BHK = ALL_FLATS.find((f) => f.type === '2BHK');
    const flat3BHK = ALL_FLATS.find((f) => f.type === '3BHK');
    const flat3BHKPrem = ALL_FLATS.find((f) => f.type === '3BHK_PREMIUM');

    expect(flat2BHK?.carpetAreaSqFt).toBe(1150);
    expect(flat3BHK?.carpetAreaSqFt).toBe(1650);
    expect(flat3BHKPrem?.carpetAreaSqFt).toBe(1950);
  });

  it('verifies East and West facings are distributed appropriately', () => {
    ALL_FLATS.forEach((flat) => {
      expect(['EAST', 'WEST']).toContain(flat.facing);
    });
  });

  it('confirms every flat contains complete room geometry and walkthrough hotspots', () => {
    ALL_FLATS.forEach((flat) => {
      expect(flat.rooms.length).toBeGreaterThanOrEqual(5);
      flat.rooms.forEach((room) => {
        expect(room.id).toBeDefined();
        expect(room.name).toBeDefined();
        expect(room.areaSqFt).toBeGreaterThan(0);
        expect(room.dimensionsMeters.width).toBeGreaterThan(0);
        expect(room.dimensionsMeters.length).toBeGreaterThan(0);
        expect(room.walkthroughHotspot[1]).toBe(1.6); // 1.6m eye height
      });
    });
  });

  it('ensures RERA placeholder matches demo format', () => {
    expect(PROJECT_DATA.reraNumber).toBe('DEMO-RERA-0000');
  });

  it('retrieves flat by ID correctly', () => {
    const flat = getFlatById('flat-10-a');
    expect(flat).toBeDefined();
    expect(flat?.unitNumber).toBe('A');
    expect(flat?.floorNumber).toBe(10);
  });
});
