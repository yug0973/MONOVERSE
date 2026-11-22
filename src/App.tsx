import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './shared/ui/Header';
import { FlatTableView } from './shared/ui/FlatTableView';
import { ErrorBoundary3D } from './shared/3d/ErrorBoundary3D';
import { SceneCanvas } from './shared/3d/SceneCanvas';
import { HeroOverlay } from './features/landing/HeroOverlay';
import { FloorSelector } from './features/building/FloorSelector';
import { FloorDetailsPanel } from './features/building/FloorDetailsPanel';
import { FlatHoverCard } from './features/building/FlatHoverCard';
import { WalkthroughControls } from './features/walkthrough/WalkthroughControls';
import { CustomizerDock } from './features/customizer/CustomizerDock';
import { CompassWidget } from './features/ui/CompassWidget';
import { FloorPlanModal } from './features/floorplan/FloorPlanModal';
import { EnquiryModal } from './features/enquiry/EnquiryModal';
import { AdminLeadsPage } from './features/admin/AdminLeadsPage';
import { GallerySection } from './features/sections/GallerySection';
import { FaqSection } from './features/sections/FaqSection';
import { FooterSection } from './features/sections/FooterSection';
import { ExperienceContainer } from './features/journey/ExperienceContainer';
import { DebugHUD } from './shared/3d/DebugHUD';
import { PanoramaHUD } from './features/panorama/PanoramaHUD';
import { StillRoomViewer } from './features/panorama/StillRoomViewer';
import { PROJECT_DATA } from './data/projectData';
import { Compass, MapPin } from 'lucide-react';

export const App: React.FC = () => {
  const {
    loadFromUrlParams,
    setShowFloorPlanTable2D,
  } = useAppStore();

  const [currentHash, setCurrentHash] = useState<string>(
    typeof window !== 'undefined' ? window.location.hash : ''
  );

  useEffect(() => {
    // Parse URL params for saved/shared design links
    if (typeof window !== 'undefined') {
      loadFromUrlParams(window.location.search);

      const handleHashChange = () => setCurrentHash(window.location.hash);
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, [loadFromUrlParams]);

  // If visiting the internal sales CRM demo route (#admin-demo)
  if (currentHash === '#admin-demo') {
    return (
      <AdminLeadsPage
        onBack={() => {
          window.location.hash = '';
          setCurrentHash('');
        }}
      />
    );
  }

  // Check if viewing standalone image journey mode via route or query param
  const isImageJourney =
    currentHash === '#image-journey' ||
    (typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('experience') === 'journey');

  if (isImageJourney) {
    return (
      <ExperienceContainer
        onEnter3DApp={() => {
          window.location.hash = '#3d-explorer';
          setCurrentHash('#3d-explorer');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col">
      {/* Top Navigation */}
      <Header />

      {/* Main 3D Viewport Area */}
      <main className="relative pt-16 flex-1 flex flex-col">
        <section
          aria-label="3D Tower & Residence Explorer"
          className={`relative w-full h-[calc(100vh-64px)] bg-canvas-light overflow-hidden border-b border-canvas-muted transition-all duration-300`}
        >
          <ErrorBoundary3D onOpenTableFallback={() => setShowFloorPlanTable2D(true)}>
            {/* Live 3D Scene Viewport */}
            <SceneCanvas />

            {/* Real-time Graphics Architecture Debug HUD (?debug=1 hotkey 'd') */}
            <DebugHUD />

            {/* Rotating Architectural Compass & Solar Azimuth Widget */}
            <CompassWidget />

            {/* Restrained Landing Hero Overlay */}
            <HeroOverlay />

            {/* Vertical Floor Selector Dock */}
            <FloorSelector />

            {/* Interactive Floor Details Side Panel & Mobile Drawer (Module 3) */}
            <FloorDetailsPanel />

            {/* Photoreal Still Room Viewer for Bedroom, Kitchen, Balcony (Module 5) */}
            <StillRoomViewer />

            {/* 360 Interior Panorama HUD & 800ms Warm Mask Dissolve (Module 4) */}
            <PanoramaHUD />

            {/* Hover Flat Preview Card */}
            <FlatHoverCard />

            {/* First-Person Walkthrough HUD & Controls */}
            <WalkthroughControls />

            {/* Architectural Customizer Dock (Always available in flat views) */}
            <CustomizerDock />
          </ErrorBoundary3D>
        </section>

        {/* Project Highlights Ribbon */}
        <section className="bg-canvas-subtle/80 border-b border-canvas-muted py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-medium text-ink-primary">
                G + 14
              </div>
              <div className="text-xs text-ink-muted uppercase tracking-wider mt-1">
                Tower Superstructure
              </div>
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-medium text-ink-primary">
                4 Flats / Floor
              </div>
              <div className="text-xs text-ink-muted uppercase tracking-wider mt-1">
                Exclusive Low-Density
              </div>
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-medium text-ink-primary">
                1,150 – 1,950
              </div>
              <div className="text-xs text-ink-muted uppercase tracking-wider mt-1">
                Carpet Area (Sq Ft)
              </div>
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-medium text-ink-primary">
                East & West
              </div>
              <div className="text-xs text-ink-muted uppercase tracking-wider mt-1">
                Dual-Facing Views
              </div>
            </div>
          </div>
        </section>

        {/* Curated Amenities Section */}
        <section id="amenities" className="py-20 bg-canvas">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <span className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium">
                Sanctuary Living
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ink-primary mt-2">
                Thoughtfully crafted resident amenities
              </h2>
              <p className="text-sm text-ink-muted mt-3 leading-relaxed">
                Designed as natural extensions of your private home, blending quiet wellness spaces with elevated leisure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PROJECT_DATA.amenities.map((item) => (
                <div
                  key={item.id}
                  className="p-6 bg-canvas-light border border-canvas-muted rounded hover:border-accent-brass/40 transition-colors shadow-soft"
                >
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent-terracotta mb-2">
                    {item.location}
                  </div>
                  <h3 className="font-serif text-xl font-medium text-ink-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Neighborhood & Distances */}
        <section className="py-20 bg-canvas-subtle/50 border-t border-canvas-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium">
                  The Location
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ink-primary mt-2 mb-4">
                  {PROJECT_DATA.locationNeighborhood}
                </h2>
                <p className="text-sm text-ink-muted leading-relaxed mb-8">
                  Nestled along Vadodara’s tranquil western avenue, Aarohan Residences places you moments from premier healthcare, cultural centers, and transit without the urban congestion.
                </p>

                <div className="space-y-3">
                  {PROJECT_DATA.landmarks.map((l) => (
                    <div
                      key={l.name}
                      className="flex items-center justify-between p-3.5 bg-canvas border border-canvas-muted rounded"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-accent-terracotta shrink-0" />
                        <span className="text-sm font-medium text-ink-primary">{l.name}</span>
                      </div>
                      <div className="text-xs text-ink-muted">
                        <span className="font-semibold text-ink-secondary">{l.driveTimeMin} mins</span> ({l.distanceKm} km)
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Architectural Styled Static Map Illustration */}
              <div className="aspect-[4/3] bg-canvas border border-canvas-muted rounded p-8 flex flex-col justify-between relative overflow-hidden shadow-soft">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  {/* Grid lines */}
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-ink-muted">
                      Cadastral Reference
                    </div>
                    <div className="font-serif text-lg font-medium text-ink-primary">
                      Sevasi-Bhayli Green Belt
                    </div>
                  </div>
                  <div className="text-xs font-mono text-accent-brass bg-canvas-subtle px-2 py-1 rounded">
                    22.31° N, 73.13° E
                  </div>
                </div>

                <div className="relative z-10 my-auto text-center py-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-terracotta text-white shadow-card mb-2">
                    <Compass className="w-7 h-7" />
                  </div>
                  <div className="font-serif text-xl font-medium text-ink-primary">
                    Aarohan Residences
                  </div>
                  <div className="text-xs text-ink-muted mt-1">
                    G+14 Elevated Living Structure
                  </div>
                </div>

                <div className="relative z-10 text-xs text-ink-muted flex items-center justify-between border-t border-canvas-muted pt-3">
                  <span>Vadodara Municipal Limits</span>
                  <span>Direct Sevasi Canal Access</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Architectural Perspectives & Renders Gallery */}
        <GallerySection />

        {/* Frequently Answered Questions */}
        <FaqSection />
      </main>

      {/* Accessible Flat Table Directory Modal */}
      <FlatTableView />

      {/* 2D Architectural Blueprint Modal */}
      <FloorPlanModal />

      {/* Site Visit Booking Modal */}
      <EnquiryModal />

      {/* Architectural Colophon Footer */}
      <FooterSection />
    </div>
  );
};
