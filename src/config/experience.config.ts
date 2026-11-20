/**
 * AAROHAN RESIDENCES — FRONT-OF-SITE IMAGE JOURNEY CONFIGURATION (MODULE 2)
 *
 * Config-driven architectural experience defining rooms, time-of-day variants,
 * panorama seam yaw clamping, per-image alignment transforms, and calibration targets.
 */

export type TimeOfDayVariant = 'day' | 'sunset' | 'night';

export interface RoomHotspot {
  id: string;
  label: string;
  targetRoomId: string;
  // Normalized percentage coordinates [0..100] within equirectangular panorama or 16:9 still
  xPercent: number;
  yPercent: number;
}

export interface ImageTransform {
  scale: number;
  x: number; // Pixels or percentage offset
  y: number; // Pixels or percentage offset
}

export interface RoomConfig {
  id: string;
  title: string;
  shortLabel: string;
  type: 'panorama' | 'still';
  availableVariants: TimeOfDayVariant[];
  defaultVariant: TimeOfDayVariant;
  // Map of variant -> asset public paths
  sources: {
    [key in TimeOfDayVariant]?: {
      desktop: string;
      mobile: string;
    };
  };
  // Initial camera orientation for panoramas
  initialView?: {
    yaw: number; // Degrees [-180..180]
    pitch: number; // Degrees [-90..90]
    fov: number; // Degrees [30..100]
  };
  // Per-variant fine transform alignment (mitigates AI render shifts)
  transforms?: {
    [key in TimeOfDayVariant]?: ImageTransform;
  };
  hotspots?: RoomHotspot[];
}

export interface ExperienceConfig {
  conceptNoticeText: string;
  palette: {
    ivory: string;
    terracotta: string;
    charcoal: string;
    navyScrim: string;
  };
  hero: {
    images: {
      desktop: string;
      mobile: string;
    };
    // Target coordinate on hero_dusk for the zoom transition (Module 3)
    // Cream balcony under the right-hand terracotta block (~ x 77%, y 38%)
    zoomTarget: {
      xPercent: number;
      yPercent: number;
      scale: number;
    };
    headline: string;
    tagline: string;
    description: string;
    ctaLabel: string;
  };
  flatCloseup: {
    images: {
      desktop: string;
      mobile: string;
    };
    zoomTarget: {
      xPercent: number;
      yPercent: number;
      scale: number;
    };
  };
  panoramaSettings: {
    // Left/right seam occurs at x = 0% / 100%
    enableYawLimit: boolean;
    // Clamps yaw within +/-150 deg of initial balcony view (prevents seeing seam)
    yawRangeDegrees: number;
    defaultFov: number;
    minFov: number;
    maxFov: number;
  };
  rooms: RoomConfig[];
}

export const EXPERIENCE_CONFIG: ExperienceConfig = {
  conceptNoticeText: "Concept render / artist's impression",

  palette: {
    ivory: '#F7F3EC',
    terracotta: '#B5654A',
    charcoal: '#2B2B2E',
    navyScrim: 'rgba(7, 13, 24, 0.88)',
  },

  hero: {
    images: {
      desktop: '/assets/desktop/exterior/hero_dusk.webp',
      mobile: '/assets/mobile/exterior/hero_dusk.webp',
    },
    zoomTarget: {
      xPercent: 77.0, // Calibrate with ?debug=1
      yPercent: 38.0,
      scale: 3.4,
    },
    headline: 'Aarohan Residences',
    tagline: 'Live above the noise.',
    description:
      'A private 14-storey residential sanctuary along the Sevasi–Bhayli green corridor. Curated 3 & 4 BHK homes designed for biophilic light and calm.',
    ctaLabel: 'Explore the residences',
  },

  flatCloseup: {
    images: {
      desktop: '/assets/desktop/exterior/flat_closeup_dusk.webp',
      mobile: '/assets/mobile/exterior/flat_closeup_dusk.webp',
    },
    zoomTarget: {
      xPercent: 51.5,
      yPercent: 46.0,
      scale: 2.2,
    },
  },

  panoramaSettings: {
    enableYawLimit: true, // Set false if seamless 360 is supplied later
    yawRangeDegrees: 150, // Clamps +/- 150 degrees around start yaw
    defaultFov: 70,
    minFov: 40,
    maxFov: 90,
  },

  rooms: [
    {
      id: 'living',
      title: 'Grand Living & Dining Salon',
      shortLabel: 'Living Room',
      type: 'panorama',
      availableVariants: ['day', 'sunset', 'night'],
      defaultVariant: 'sunset',
      sources: {
        sunset: {
          desktop: '/assets/desktop/panorama/pano_living_sunset.webp',
          mobile: '/assets/mobile/panorama/pano_living_sunset.webp',
        },
        day: {
          desktop: '/assets/desktop/panorama/pano_living_day.webp',
          mobile: '/assets/mobile/panorama/pano_living_day.webp',
        },
        night: {
          desktop: '/assets/desktop/panorama/pano_living_night.webp',
          mobile: '/assets/mobile/panorama/pano_living_night.webp',
        },
      },
      // Facing the exterior balcony window directly at start
      // Formula: yaw = (xPercent/100 - 0.5) * 360
      // For x = 51%, yaw = (0.51 - 0.5) * 360 = +3.6 deg
      initialView: {
        yaw: 3.6,
        pitch: -3.0,
        fov: 70,
      },
      hotspots: [
        {
          id: 'hs-balcony',
          label: 'Private Balcony',
          targetRoomId: 'balcony',
          xPercent: 51.0,
          yPercent: 52.0,
        },
        {
          id: 'hs-living',
          label: 'Living Area',
          targetRoomId: 'living',
          xPercent: 30.0,
          yPercent: 62.0,
        },
        {
          id: 'hs-dining',
          label: 'Dining Salon',
          targetRoomId: 'bedroom', // Navigates deeper into bedroom
          xPercent: 76.0,
          yPercent: 64.0,
        },
        {
          id: 'hs-kitchen',
          label: 'Modular Kitchen',
          targetRoomId: 'kitchen',
          xPercent: 91.5,
          yPercent: 52.0,
        },
      ],
    },

    {
      id: 'bedroom',
      title: 'Master Suite Sanctuary',
      shortLabel: 'Master Bedroom',
      type: 'still',
      availableVariants: ['sunset', 'night'],
      defaultVariant: 'sunset',
      sources: {
        sunset: {
          desktop: '/assets/desktop/stills/still_bedroom_sunset.webp',
          mobile: '/assets/mobile/stills/still_bedroom_sunset.webp',
        },
        night: {
          desktop: '/assets/desktop/stills/still_bedroom_night.webp',
          mobile: '/assets/mobile/stills/still_bedroom_night.webp',
        },
      },
      // Per-image transform config: bedroom night has slight pixel shift vs sunset
      transforms: {
        sunset: { scale: 1.0, x: 0, y: 0 },
        night: { scale: 1.012, x: -6, y: 3 }, // Calibrate with ?debug=1
      },
      hotspots: [
        {
          id: 'hs-bed-to-living',
          label: 'Return to Living',
          targetRoomId: 'living',
          xPercent: 12.0,
          yPercent: 70.0,
        },
      ],
    },

    {
      id: 'kitchen',
      title: 'Chef’s Modular Kitchen',
      shortLabel: 'Kitchen',
      type: 'still',
      availableVariants: ['day', 'sunset'], // Only verified available stops
      defaultVariant: 'sunset',
      sources: {
        sunset: {
          desktop: '/assets/desktop/stills/still_kitchen_sunset.webp',
          mobile: '/assets/mobile/stills/still_kitchen_sunset.webp',
        },
        day: {
          desktop: '/assets/desktop/stills/still_kitchen_day.webp',
          mobile: '/assets/mobile/stills/still_kitchen_day.webp',
        },
      },
      // Fixed 1.06 scale centered to clip ~5% stretched filler border
      transforms: {
        sunset: { scale: 1.06, x: 0, y: 0 },
        day: { scale: 1.06, x: 0, y: 0 },
      },
      hotspots: [
        {
          id: 'hs-kitchen-to-living',
          label: 'Return to Living',
          targetRoomId: 'living',
          xPercent: 18.0,
          yPercent: 75.0,
        },
      ],
    },

    {
      id: 'balcony',
      title: 'Skyline Sundeck Balcony',
      shortLabel: 'Balcony',
      type: 'still',
      availableVariants: ['sunset'], // Sunset only; no fake CSS filters
      defaultVariant: 'sunset',
      sources: {
        sunset: {
          desktop: '/assets/desktop/stills/still_balcony_sunset.webp',
          mobile: '/assets/mobile/stills/still_balcony_sunset.webp',
        },
      },
      transforms: {
        sunset: { scale: 1.0, x: 0, y: 0 },
      },
      hotspots: [
        {
          id: 'hs-balcony-to-living',
          label: 'Step Inside',
          targetRoomId: 'living',
          xPercent: 88.0,
          yPercent: 72.0,
        },
      ],
    },
  ],
};
