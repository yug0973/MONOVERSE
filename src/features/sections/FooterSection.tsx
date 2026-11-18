import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { PROJECT_DATA } from '../../data/projectData';
import { ShieldCheck, Building2, Table, Calendar } from 'lucide-react';

export const FooterSection: React.FC = () => {
  const { setShowFloorPlanTable2D, openEnquiryModal, setViewMode } = useAppStore();

  return (
    <footer className="bg-canvas-subtle border-t border-canvas-muted text-ink-muted text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="font-serif text-2xl font-semibold tracking-wider text-ink-primary">
              AAROHAN RESIDENCES
            </div>
            <p className="font-serif italic text-base text-ink-secondary">
              "{PROJECT_DATA.tagline}"
            </p>
            <p className="text-xs text-ink-muted leading-relaxed max-w-sm">
              Sevasi-Bhayli Green Corridor, Vadodara, Gujarat 391101. An exclusive 14-storey residential sanctuary featuring 56 bespoke residences.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-[11px] text-ink-secondary">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-brass" />
              <span>RERA Reg: <strong className="font-mono">{PROJECT_DATA.reraNumber}</strong> (Demonstration)</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-primary">
              Exploration
            </div>
            <ul className="space-y-1.5 text-xs text-ink-secondary">
              <li>
                <button
                  onClick={() => {
                    setViewMode('building');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-accent-terracotta transition-colors flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-ink-muted" />
                  <span>3D Tower Explorer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowFloorPlanTable2D(true)}
                  className="hover:text-accent-terracotta transition-colors flex items-center gap-1.5"
                >
                  <Table className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Residences Directory (56 Units)</span>
                </button>
              </li>
              <li>
                <a href="#amenities" className="hover:text-accent-terracotta transition-colors">
                  Curated Amenities
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-accent-terracotta transition-colors">
                  Architectural Gallery
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-accent-terracotta transition-colors">
                  Frequently Answered Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Experience & Sales */}
          <div className="space-y-2.5">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-primary">
              Private Tour
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              Experience the spatial scale, daylight orientation, and custom finishes in person.
            </p>
            <button
              onClick={openEnquiryModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-accent-terracotta text-white text-xs font-medium hover:bg-accent-terracotta-hover transition-colors shadow-soft"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Hosted Visit</span>
            </button>
            <div className="pt-2">
              <a
                href="#admin-demo"
                className="text-[11px] text-ink-muted hover:text-ink-primary underline"
              >
                Open Builder Leads CRM (#admin-demo)
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Colophon & Compliance Disclaimer */}
        <div className="pt-8 border-t border-canvas-muted flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-canvas border border-canvas-muted text-ink-primary font-medium text-[11px]">
              Demo Project — Architectural Showcase
            </span>
            <span>Does not represent real residential property offering or solicitation</span>
          </div>

          <div className="text-[11px] text-ink-muted">
            Designed with Vite + React 18 + Three.js + Zustand + Tailwind CSS
          </div>
        </div>
      </div>
    </footer>
  );
};
