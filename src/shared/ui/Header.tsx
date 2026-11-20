import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from './Button';
import { Building2, Table, Calendar, Eye, Compass } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    viewMode,
    selectedFloorNumber,
    selectedFlatId,
    setViewMode,
    selectFloor,
    selectFlat,
    openEnquiryModal,
    showFloorPlanTable2D,
    setShowFloorPlanTable2D,
    isLiteQuality,
    toggleLiteQuality,
  } = useAppStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-canvas/85 backdrop-blur-md border-b border-canvas-muted/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              selectFlat(null);
              selectFloor(null);
              setViewMode('landing');
            }}
            className="text-left group focus-visible:outline-ink-primary"
          >
            <div className="font-serif text-xl sm:text-2xl font-semibold tracking-wider text-ink-primary group-hover:text-accent-terracotta transition-colors">
              AAROHAN
            </div>
            <div className="text-[10px] tracking-[0.2em] uppercase font-sans text-ink-muted -mt-1">
              Residences · Vadodara
            </div>
          </button>

          {/* Mode Breadcrumb */}
          <div className="hidden md:flex items-center pl-4 border-l border-canvas-muted gap-2 text-xs text-ink-muted">
            <button
              onClick={() => {
                selectFlat(null);
                selectFloor(null);
                setViewMode('building');
              }}
              className={`hover:text-ink-primary transition-colors flex items-center gap-1.5 ${
                viewMode === 'building' ? 'text-accent-terracotta font-medium' : ''
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Tower</span>
            </button>

            {selectedFloorNumber !== null && (
              <>
                <span>/</span>
                <button
                  onClick={() => selectFloor(selectedFloorNumber)}
                  className={`hover:text-ink-primary transition-colors ${
                    viewMode === 'floor_slice' ? 'text-accent-terracotta font-medium' : ''
                  }`}
                >
                  Floor {selectedFloorNumber}
                </button>
              </>
            )}

            {selectedFlatId && (
              <>
                <span>/</span>
                <span className="text-accent-terracotta font-semibold uppercase">
                  {selectedFlatId.replace('flat-', 'Unit ')}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Image Journey */}
          <button
            onClick={() => {
              window.location.hash = '';
              window.location.search = '';
              window.location.reload();
            }}
            className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-primary px-2.5 py-1.5 rounded border border-canvas-muted hover:bg-canvas-subtle transition-colors"
            title="Return to Front-of-Site Concept Journey"
          >
            <Compass className="w-3.5 h-3.5 text-accent-terracotta" />
            <span className="hidden md:inline">Photo Tour</span>
          </button>

          {/* Quality toggle */}
          <button
            onClick={() => toggleLiteQuality()}
            title={isLiteQuality ? 'Switch to High Quality 3D' : 'Switch to Lite Performance 3D'}
            className="hidden lg:flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-primary px-2.5 py-1 rounded border border-canvas-muted hover:bg-canvas-subtle transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isLiteQuality ? 'Lite Mode' : 'HQ 3D'}</span>
          </button>

          {/* Accessible 2D Table fallback */}
          <button
            onClick={() => setShowFloorPlanTable2D(!showFloorPlanTable2D)}
            className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary px-2.5 py-1.5 rounded border border-canvas-muted hover:bg-canvas-subtle transition-colors"
            title="View complete list of all flats"
          >
            <Table className="w-3.5 h-3.5 text-ink-muted" />
            <span className="hidden sm:inline">All Flats</span>
          </button>

          {/* Admin CRM demo */}
          <a
            href="#admin-demo"
            className="hidden sm:inline-flex text-xs text-ink-muted hover:text-ink-primary px-2.5 py-1.5 rounded hover:bg-canvas-subtle transition-colors"
          >
            Leads CRM
          </a>

          {/* Primary Action */}
          <Button
            variant="terracotta"
            size="sm"
            onClick={openEnquiryModal}
            icon={<Calendar className="w-3.5 h-3.5" />}
          >
            <span className="hidden xs:inline">Book Site Visit</span>
            <span className="xs:hidden">Enquire</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
