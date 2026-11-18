import { create } from 'zustand';
import { ViewMode, QualityTier } from '../types/navigation';
import {
  FlatCustomizationState,
  FlooringId,
  FurnitureTier,
  TimeOfDay,
  WallPaletteId,
} from '../types/customizer';
import { decodeConfigFromUrl, encodeConfigToUrl } from '../lib/urlEncoding';
import { getFlatById } from '../data/buildingData';

export const DEFAULT_CUSTOMIZATION: FlatCustomizationState = {
  wallMode: 'global',
  globalWallColor: 'ivory_wash',
  roomWallColors: {},
  flooring: 'light_marble',
  furniturePackage: 'essential',
  timeOfDay: 'golden_hour',
};

export interface AppStoreState {
  // Navigation
  viewMode: ViewMode;
  selectedFloorNumber: number | null;
  selectedFlatId: string | null;
  activeRoomId: string | null;
  activeHotspot: [number, number, number] | null;

  // Customizer
  customization: FlatCustomizationState;
  baselineCustomization: FlatCustomizationState;
  isComparingOriginal: boolean;

  // Hover sync
  hoveredFloorNumber: number | null;
  hoveredFlatId: string | null;
  hoveredRoomId: string | null;

  // Performance & Accessibility
  fps: number;
  qualityTier: QualityTier;
  isLiteQuality: boolean;
  dpr: number;
  prefersReducedMotion: boolean;
  showFloorPlanTable2D: boolean;

  // Modals
  isEnquiryModalOpen: boolean;
  isFloorPlanModalOpen: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  selectFloor: (floor: number | null) => void;
  selectFlat: (flatId: string | null) => void;
  enterRoom: (roomId: string) => void;
  exitToDollhouse: () => void;
  exitToBuilding: () => void;
  exitToLanding: () => void;

  setWallPalette: (paletteId: WallPaletteId, roomId?: string) => void;
  setFlooring: (flooringId: FlooringId) => void;
  setFurniturePackage: (tier: FurnitureTier) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  toggleCompareOriginal: () => void;
  resetCustomization: () => void;
  loadFromUrlParams: (searchString: string) => void;
  getShareUrl: () => string;

  setHoveredFloor: (floor: number | null) => void;
  setHoveredFlat: (flatId: string | null) => void;
  setHoveredRoom: (roomId: string | null) => void;

  setFps: (fps: number) => void;
  toggleLiteQuality: (enable?: boolean) => void;
  setShowFloorPlanTable2D: (show: boolean) => void;

  openEnquiryModal: () => void;
  closeEnquiryModal: () => void;
  toggleFloorPlanModal: (open?: boolean) => void;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  // Initial navigation
  viewMode: 'landing',
  selectedFloorNumber: null,
  selectedFlatId: null,
  activeRoomId: null,
  activeHotspot: null,

  // Initial customizer
  customization: { ...DEFAULT_CUSTOMIZATION },
  baselineCustomization: { ...DEFAULT_CUSTOMIZATION },
  isComparingOriginal: false,

  // Hover states
  hoveredFloorNumber: null,
  hoveredFlatId: null,
  hoveredRoomId: null,

  // Performance
  fps: 60,
  qualityTier: 'high',
  isLiteQuality: false,
  dpr: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1,
  prefersReducedMotion: false,
  showFloorPlanTable2D: false,

  // Modals
  isEnquiryModalOpen: false,
  isFloorPlanModalOpen: false,

  // Actions
  setViewMode: (viewMode) => set({ viewMode }),

  selectFloor: (floorNumber) => {
    if (floorNumber === null) {
      set({
        selectedFloorNumber: null,
        selectedFlatId: null,
        activeRoomId: null,
        viewMode: 'building',
      });
    } else {
      set({
        selectedFloorNumber: floorNumber,
        selectedFlatId: null,
        activeRoomId: null,
        viewMode: 'floor_slice',
      });
    }
  },

  selectFlat: (flatId) => {
    if (!flatId) {
      set({
        selectedFlatId: null,
        activeRoomId: null,
        viewMode: get().selectedFloorNumber ? 'floor_slice' : 'building',
      });
      return;
    }

    const flat = getFlatById(flatId);
    if (!flat || flat.status === 'SOLD') return;

    // Reset customization to defaults for this unit or retain current
    set({
      selectedFlatId: flatId,
      selectedFloorNumber: flat.floorNumber,
      activeRoomId: null,
      viewMode: 'dollhouse',
      baselineCustomization: { ...get().customization },
      isComparingOriginal: false,
    });
  },

  enterRoom: (roomId) => {
    const flatId = get().selectedFlatId;
    if (!flatId) return;

    const flat = getFlatById(flatId);
    const room = flat?.rooms.find((r) => r.id === roomId);

    if (room) {
      set({
        activeRoomId: roomId,
        activeHotspot: room.walkthroughHotspot,
        viewMode: 'walkthrough',
      });
    }
  },

  exitToDollhouse: () => {
    set({
      activeRoomId: null,
      activeHotspot: null,
      viewMode: 'dollhouse',
    });
  },

  exitToBuilding: () => {
    set({
      selectedFlatId: null,
      activeRoomId: null,
      activeHotspot: null,
      viewMode: get().selectedFloorNumber ? 'floor_slice' : 'building',
    });
  },

  exitToLanding: () => {
    set({
      selectedFloorNumber: null,
      selectedFlatId: null,
      activeRoomId: null,
      activeHotspot: null,
      viewMode: 'landing',
    });
  },

  setWallPalette: (paletteId, roomId) => {
    set((state) => {
      if (roomId) {
        return {
          customization: {
            ...state.customization,
            wallMode: 'per_room',
            roomWallColors: {
              ...state.customization.roomWallColors,
              [roomId]: paletteId,
            },
          },
        };
      }
      return {
        customization: {
          ...state.customization,
          wallMode: 'global',
          globalWallColor: paletteId,
          roomWallColors: {},
        },
      };
    });
  },

  setFlooring: (flooring) => {
    set((state) => ({
      customization: { ...state.customization, flooring },
    }));
  },

  setFurniturePackage: (furniturePackage) => {
    set((state) => ({
      customization: { ...state.customization, furniturePackage },
    }));
  },

  setTimeOfDay: (timeOfDay) => {
    set((state) => ({
      customization: { ...state.customization, timeOfDay },
    }));
  },

  toggleCompareOriginal: () => {
    set((state) => ({
      isComparingOriginal: !state.isComparingOriginal,
    }));
  },

  resetCustomization: () => {
    set({
      customization: { ...DEFAULT_CUSTOMIZATION },
      isComparingOriginal: false,
    });
  },

  loadFromUrlParams: (searchString) => {
    const { flatId, customization } = decodeConfigFromUrl(searchString);
    if (flatId) {
      const flat = getFlatById(flatId);
      if (flat && flat.status !== 'SOLD') {
        set({
          selectedFlatId: flatId,
          selectedFloorNumber: flat.floorNumber,
          viewMode: 'dollhouse',
        });
      }
    }
    if (customization) {
      set((state) => ({
        customization: {
          ...state.customization,
          ...customization,
        },
        baselineCustomization: {
          ...state.customization,
          ...customization,
        },
      }));
    }
  },

  getShareUrl: () => {
    const { selectedFlatId, customization } = get();
    const flatId = selectedFlatId || 'flat-12-a';
    const query = encodeConfigToUrl(flatId, customization);
    if (typeof window === 'undefined') return `?${query}`;
    return `${window.location.origin}${window.location.pathname}?${query}`;
  },

  setHoveredFloor: (hoveredFloorNumber) => set({ hoveredFloorNumber }),
  setHoveredFlat: (hoveredFlatId) => set({ hoveredFlatId }),
  setHoveredRoom: (hoveredRoomId) => set({ hoveredRoomId }),

  setFps: (fps) => {
    set((state) => {
      // Auto-fallback to lite quality if FPS stays below 30
      if (fps < 30 && !state.isLiteQuality) {
        return { fps, isLiteQuality: true, qualityTier: 'lite' };
      }
      return { fps };
    });
  },

  toggleLiteQuality: (enable) => {
    set((state) => {
      const isLite = enable !== undefined ? enable : !state.isLiteQuality;
      return {
        isLiteQuality: isLite,
        qualityTier: isLite ? 'lite' : 'high',
      };
    });
  },

  setShowFloorPlanTable2D: (showFloorPlanTable2D) => set({ showFloorPlanTable2D }),

  openEnquiryModal: () => set({ isEnquiryModalOpen: true }),
  closeEnquiryModal: () => set({ isEnquiryModalOpen: false }),
  toggleFloorPlanModal: (open) =>
    set((state) => ({
      isFloorPlanModalOpen: open !== undefined ? open : !state.isFloorPlanModalOpen,
    })),
}));

if (typeof window !== 'undefined') {
  (window as unknown as { __APP_STORE__: typeof useAppStore }).__APP_STORE__ = useAppStore;
}
