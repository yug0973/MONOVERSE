import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { WallColorPicker } from './WallColorPicker';
import { FlooringPicker } from './FlooringPicker';
import { FurniturePackagePicker } from './FurniturePackagePicker';
import { TimeOfDayPicker } from './TimeOfDayPicker';
import { CompareToggle } from './CompareToggle';
import { ShareConfigModal } from './ShareConfigModal';
import { PricingDetailsModal } from '../pricing/PricingDetailsModal';
import { Drawer } from '../../shared/ui/Drawer';
import { encodeConfigToUrl } from '../../lib/urlEncoding';
import {
  Palette,
  Grid,
  Armchair,
  Sun,
  Share2,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Map,
  Receipt,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type CustomizerTab = 'walls' | 'flooring' | 'furniture' | 'lighting';

export const CustomizerDock: React.FC = () => {
  const {
    viewMode,
    selectedFlatId,
    customization,
    isComparingOriginal,
    toggleFloorPlanModal,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<CustomizerTab>('walls');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);

  const isFlatView = viewMode === 'dollhouse' || viewMode === 'walkthrough';

  // Automatically sync customization state to browser URL search parameters without page reload
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedFlatId && isFlatView) {
      const queryString = encodeConfigToUrl(selectedFlatId, customization);
      const newUrl = `${window.location.pathname}?${queryString}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [selectedFlatId, customization, isFlatView]);

  if (!isFlatView || !selectedFlatId) return null;

  const tabs: Array<{ id: CustomizerTab; label: string; icon: React.ReactNode }> = [
    { id: 'walls', label: 'Walls', icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'flooring', label: 'Floors', icon: <Grid className="w-3.5 h-3.5" /> },
    { id: 'furniture', label: 'Furniture', icon: <Armchair className="w-3.5 h-3.5" /> },
    { id: 'lighting', label: 'Lighting', icon: <Sun className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      {/* Mobile Drawer Floating Trigger Button */}
      <div className="md:hidden absolute bottom-20 right-4 z-30 flex items-center gap-2">
        <button
          onClick={() => toggleFloorPlanModal(true)}
          className="p-2.5 rounded-full bg-canvas-light text-ink-primary border border-canvas-muted shadow-elevation"
          title="View 2D Floor Plan"
        >
          <Map className="w-4 h-4 text-accent-brass" />
        </button>

        <button
          onClick={() => setIsPricingModalOpen(true)}
          className="p-2.5 rounded-full bg-canvas-light text-ink-primary border border-canvas-muted shadow-elevation"
          title="Price & EMI Details"
        >
          <Receipt className="w-4 h-4 text-accent-terracotta" />
        </button>

        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink-primary text-canvas shadow-elevation text-xs font-medium"
        >
          <Sliders className="w-4 h-4 text-accent-terracotta" />
          <span>Finishes</span>
        </button>
      </div>

      {/* Mobile Bottom Sheet Drawer */}
      <Drawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title="Customizer Suite"
        subtitle="Live architectural finishes and spatial packages"
        position="bottom"
      >
        <div className="space-y-4">
          {/* Tab Selector */}
          <div className="flex items-center gap-1 p-1 bg-canvas-subtle rounded border border-canvas-muted overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-canvas text-ink-primary shadow-soft'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Active Tab Panel */}
          <div className="py-2">
            {activeTab === 'walls' && <WallColorPicker />}
            {activeTab === 'flooring' && <FlooringPicker />}
            {activeTab === 'furniture' && <FurniturePackagePicker />}
            {activeTab === 'lighting' && <TimeOfDayPicker />}
          </div>

          {/* Compare & Reset */}
          <CompareToggle />

          {/* Additional tools: Floor Plan & Pricing */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-canvas-muted">
            <button
              onClick={() => {
                setIsMobileDrawerOpen(false);
                toggleFloorPlanModal(true);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-canvas-subtle border border-canvas-muted text-xs font-medium text-ink-secondary hover:bg-canvas-muted"
            >
              <Map className="w-3.5 h-3.5 text-accent-brass" />
              <span>2D Blueprint</span>
            </button>

            <button
              onClick={() => {
                setIsMobileDrawerOpen(false);
                setIsPricingModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded bg-canvas-subtle border border-canvas-muted text-xs font-medium text-ink-secondary hover:bg-canvas-muted"
            >
              <Receipt className="w-3.5 h-3.5 text-accent-terracotta" />
              <span>Price & EMI</span>
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={() => {
              setIsMobileDrawerOpen(false);
              setIsShareModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded bg-ink-primary text-xs font-medium text-canvas hover:bg-ink-secondary transition-colors shadow-soft"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Save & Share Design URL</span>
          </button>
        </div>
      </Drawer>

      {/* Desktop Asymmetric Editorial Translucent Control Dock */}
      <aside
        aria-label="Residence Customizer Dock"
        className="hidden md:flex absolute right-4 sm:right-6 top-4 bottom-18 z-20 flex-col pointer-events-none select-none transition-all"
      >
        <div className="relative flex items-stretch h-full max-h-[550px]">
          {/* Collapse Toggle Tab */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="self-center -mr-1 z-30 p-1.5 rounded-l-md bg-canvas/90 backdrop-blur-md border-y border-l border-canvas-muted text-ink-muted hover:text-ink-primary pointer-events-auto shadow-soft"
            title={isCollapsed ? 'Expand Customizer Dock' : 'Collapse Customizer Dock'}
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Main Floating Dock Panel */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="w-88 bg-canvas/92 backdrop-blur-md border border-canvas-muted rounded-lg shadow-elevation pointer-events-auto flex flex-col overflow-hidden"
              >
                {/* Header with Title and Quick Modals */}
                <div className="px-4 py-3 border-b border-canvas-muted flex items-center justify-between bg-canvas-light/60 shrink-0">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-accent-terracotta" />
                    <span className="font-serif text-base font-semibold text-ink-primary">
                      Customizer Suite
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFloorPlanModal(true)}
                      className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors"
                      title="Open 2D Architectural Blueprint"
                    >
                      <Map className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsPricingModalOpen(true)}
                      className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors"
                      title="Open Price & EMI Calculator"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors"
                      title="Generate shareable URL"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Comparing Original Alert Pill */}
                {isComparingOriginal && (
                  <div className="px-4 py-1.5 bg-accent-terracotta text-white text-[11px] font-medium flex items-center justify-between shrink-0">
                    <span>Comparing baseline specification</span>
                    <span className="text-[10px] uppercase font-mono opacity-80">Baseline</span>
                  </div>
                )}

                {/* Segmented Tab Navigation */}
                <div className="flex items-center border-b border-canvas-muted bg-canvas-subtle/50 px-2 pt-2 shrink-0 gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium border-b-2 transition-all ${
                        activeTab === tab.id
                          ? 'border-accent-terracotta text-accent-terracotta bg-canvas/60'
                          : 'border-transparent text-ink-muted hover:text-ink-primary'
                      }`}
                    >
                      {tab.icon}
                      <span className="text-[11px]">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Scrollable Customization Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {activeTab === 'walls' && <WallColorPicker />}
                  {activeTab === 'flooring' && <FlooringPicker />}
                  {activeTab === 'furniture' && <FurniturePackagePicker />}
                  {activeTab === 'lighting' && <TimeOfDayPicker />}
                </div>

                {/* Bottom Footer Actions (Compare with Original & Reset) */}
                <div className="p-3 bg-canvas-light/60 border-t border-canvas-muted shrink-0 space-y-2">
                  <CompareToggle />

                  {/* Financial & Blueprint Action Bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => toggleFloorPlanModal(true)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-canvas border border-canvas-muted text-[11px] font-medium text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle"
                    >
                      <Map className="w-3 h-3 text-accent-brass" />
                      <span>2D Blueprint</span>
                    </button>
                    <button
                      onClick={() => setIsPricingModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-canvas border border-canvas-muted text-[11px] font-medium text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle"
                    >
                      <Receipt className="w-3 h-3 text-accent-terracotta" />
                      <span>Price / EMI</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Share Modal Dialog */}
      <ShareConfigModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Pricing & EMI Modal Dialog */}
      <PricingDetailsModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </>
  );
};
