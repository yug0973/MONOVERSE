import React, { useState } from 'react';
import { Modal } from '../../shared/ui/Modal';
import { Maximize2 } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: 'exterior' | 'interior' | 'views';
  tagline: string;
  svgPreview: React.ReactNode;
  specs: string;
}

export const GallerySection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const galleryItems: GalleryItem[] = [
    {
      id: 'tower_golden',
      title: 'Tower Superstructure at Sunset',
      category: 'exterior',
      tagline: 'G+14 architectural scale massing captured during golden hour azimuth.',
      specs: 'West-facing facade · Deep balcony cantilevers · Double-height colonnade',
      svgPreview: (
        <svg viewBox="0 0 600 400" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="sky-golden" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FCA452" />
              <stop offset="100%" stopColor="#EFEAE1" />
            </linearGradient>
          </defs>
          <rect width="600" height="400" fill="url(#sky-golden)" />
          {/* Base plate */}
          <rect x="50" y="340" width="500" height="40" fill="#E8E3DA" />
          {/* Tower mass */}
          <rect x="220" y="60" width="160" height="280" fill="#ECE7DE" stroke="#D3CDC2" strokeWidth="2" />
          {/* Slabs */}
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={i} x1="210" y1={80 + i * 18} x2="390" y2={80 + i * 18} stroke="#C4BCB0" strokeWidth="3" />
          ))}
          {/* Pergola crown */}
          <rect x="230" y="45" width="140" height="15" fill="#9E7D47" />
          <text x="300" y="380" textAnchor="middle" fill="#6A6F7C" fontSize="12" fontFamily="sans-serif">
            Aarohan Residences — Tower Massing Model
          </text>
        </svg>
      ),
    },
    {
      id: 'balcony_deck',
      title: 'Panoramic Sundeck & Horizon',
      category: 'views',
      tagline: 'Deep 2.8m cantilevered sundecks capturing unhindered horizon views.',
      specs: 'Teak floor tiles · Frameless safety glass · Orientation to Sevasi green belt',
      svgPreview: (
        <svg viewBox="0 0 600 400" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="sky-morning" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DCEBFA" />
              <stop offset="100%" stopColor="#FDFBF7" />
            </linearGradient>
          </defs>
          <rect width="600" height="400" fill="url(#sky-morning)" />
          {/* Distant trees */}
          <path d="M 0 280 Q 150 250 300 270 T 600 260 L 600 400 L 0 400 Z" fill="#6B8E7C" opacity="0.6" />
          {/* Balcony deck floor */}
          <polygon points="40,320 560,320 600,400 0,400" fill="#A47E53" />
          {/* Glass Railing */}
          <line x1="40" y1="240" x2="560" y2="240" stroke="#9E7D47" strokeWidth="4" />
          <rect x="40" y="244" width="520" height="76" fill="#8BAAB8" opacity="0.35" />
          <text x="300" y="380" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontFamily="sans-serif">
            Expansive Sundeck Horizon — 220 Sq Ft
          </text>
        </svg>
      ),
    },
    {
      id: 'living_suite',
      title: 'Architect’s Residence Salon',
      category: 'interior',
      tagline: 'Open living-dining volume with curated procedural furniture suites.',
      specs: 'Modular slate seating · Fluted credenza · Natural Banswara marble flooring',
      svgPreview: (
        <svg viewBox="0 0 600 400" className="w-full h-full object-cover">
          <rect width="600" height="400" fill="#F7F4EE" />
          {/* Wall background */}
          <rect x="50" y="40" width="500" height="260" fill="#EAE5DC" />
          {/* Floor */}
          <polygon points="50,300 550,300 600,400 0,400" fill="#E6E4DE" />
          {/* Sofa */}
          <rect x="180" y="220" width="240" height="70" rx="8" fill="#4A4E57" />
          {/* Area rug */}
          <polygon points="140,290 460,290 500,380 100,380" fill="#DDD6CA" opacity="0.8" />
          {/* Overhead light */}
          <line x1="300" y1="40" x2="300" y2="120" stroke="#9E7D47" strokeWidth="2" />
          <rect x="240" y="120" width="120" height="8" rx="3" fill="#9E7D47" />
          <text x="300" y="360" textAnchor="middle" fill="#6A6F7C" fontSize="12" fontFamily="sans-serif">
            Grand Living Salon & Dining Suite
          </text>
        </svg>
      ),
    },
    {
      id: 'master_bedroom',
      title: 'Presidential Master Suite',
      category: 'interior',
      tagline: 'Quiet sanctuary with integrated dressing nook and evening ambient lighting.',
      specs: 'King platform bed · Warm oak bedside stands · 2700K recessed accent lighting',
      svgPreview: (
        <svg viewBox="0 0 600 400" className="w-full h-full object-cover">
          <rect width="600" height="400" fill="#0E1424" />
          {/* Interior warm wall */}
          <rect x="50" y="40" width="500" height="260" fill="#242838" />
          {/* Warm spotlights */}
          <circle cx="200" cy="80" r="60" fill="#FFF2D6" opacity="0.15" />
          <circle cx="400" cy="80" r="60" fill="#FFF2D6" opacity="0.15" />
          {/* Bed */}
          <rect x="190" y="160" width="220" height="150" rx="6" fill="#50545E" />
          <rect x="210" y="200" width="180" height="110" rx="4" fill="#F4F1EA" />
          <text x="300" y="360" textAnchor="middle" fill="#C4BCB0" fontSize="12" fontFamily="sans-serif">
            Master Suite in Evening Atmospheric Ambience
          </text>
        </svg>
      ),
    },
  ];

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  return (
    <section id="gallery" className="py-20 bg-canvas-light border-t border-canvas-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium">
              Architectural Perspectives
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ink-primary mt-2">
              Visual portfolio & scene studies
            </h2>
            <p className="text-sm text-ink-muted mt-2">
              Procedural spatial compositions generated directly from Aarohan Residences dimensional specifications.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-canvas rounded border border-canvas-muted self-start md:self-auto">
            {[
              { id: 'all', label: 'All Perspectives' },
              { id: 'exterior', label: 'Exterior' },
              { id: 'interior', label: 'Interiors' },
              { id: 'views', label: 'Skyline' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs px-3 py-1.5 rounded transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-ink-primary text-canvas font-medium shadow-soft'
                    : 'text-ink-muted hover:text-ink-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group cursor-pointer bg-canvas border border-canvas-muted rounded-lg overflow-hidden shadow-soft hover:shadow-elevation transition-all flex flex-col"
            >
              {/* Image Preview Container */}
              <div className="aspect-[16/10] w-full bg-canvas-subtle overflow-hidden relative">
                {item.svgPreview}
                <div className="absolute inset-0 bg-ink-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-canvas/90 backdrop-blur-md text-ink-primary text-xs font-medium shadow-card">
                    <Maximize2 className="w-3.5 h-3.5 text-accent-terracotta" />
                    <span>Enlarge Perspective</span>
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase font-mono tracking-wider text-accent-terracotta mb-1">
                    {item.category}
                  </div>
                  <h3 className="font-serif text-xl font-medium text-ink-primary mb-1 group-hover:text-accent-terracotta transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    {item.tagline}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-canvas-muted/60 text-[11px] text-ink-secondary font-mono">
                  {item.specs}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Dialog */}
      {activeItem && (
        <Modal
          isOpen={Boolean(activeItem)}
          onClose={() => setActiveItem(null)}
          title={activeItem.title}
          subtitle={activeItem.specs}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="aspect-[16/10] w-full rounded overflow-hidden border border-canvas-muted">
              {activeItem.svgPreview}
            </div>
            <p className="text-xs text-ink-muted leading-relaxed">
              {activeItem.tagline} Rendered procedurally using three-dimensional architectural primitives and physically calculated lighting models.
            </p>
          </div>
        </Modal>
      )}
    </section>
  );
};
