import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Eye, Layers, Box } from 'lucide-react';

/**
 * Senior Architectural Real-Time Debug HUD (Module 2)
 * Activates when ?debug=1 query parameter is present in the URL.
 * Hotkey 'D' / 'd' cycles between:
 * 1. Textured: Full PBR textures + emissive maps + physical geometry
 * 2. Clay: Pure architectural white clay (studies massing, proportions & soft shadows)
 * 3. Wireframe: Structural polygon topology
 */
export const DebugHUD: React.FC = () => {
  const { isDebugEnabled, debugMode, cycleDebugMode, setDebugMode } = useAppStore();

  useEffect(() => {
    // Enable debug if ?debug=1 is in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('debug') === '1' && !isDebugEnabled) {
        useAppStore.setState({ isDebugEnabled: true });
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey 'd' or 'D' to toggle debug modes
      if ((e.key === 'd' || e.key === 'D') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        cycleDebugMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDebugEnabled, cycleDebugMode]);

  if (!isDebugEnabled) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink-primary/90 text-canvas backdrop-blur-md border border-white/20 shadow-elevation text-xs font-mono select-none">
      <span className="text-[10px] uppercase text-accent-terracotta font-semibold tracking-wider mr-1">
        Debug (?debug=1)
      </span>

      <button
        onClick={() => setDebugMode('textured')}
        className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
          debugMode === 'textured' ? 'bg-accent-terracotta text-white font-medium shadow-soft' : 'text-canvas/60 hover:text-white'
        }`}
        title="PBR Textured Mode"
      >
        <Eye className="w-3 h-3" />
        <span>Textured</span>
      </button>

      <button
        onClick={() => setDebugMode('clay')}
        className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
          debugMode === 'clay' ? 'bg-accent-terracotta text-white font-medium shadow-soft' : 'text-canvas/60 hover:text-white'
        }`}
        title="Architectural White Clay Mode (Studies Massing & Shadow)"
      >
        <Box className="w-3 h-3" />
        <span>Clay</span>
      </button>

      <button
        onClick={() => setDebugMode('wireframe')}
        className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
          debugMode === 'wireframe' ? 'bg-accent-terracotta text-white font-medium shadow-soft' : 'text-canvas/60 hover:text-white'
        }`}
        title="Wireframe Mesh Topology"
      >
        <Layers className="w-3 h-3" />
        <span>Wireframe</span>
      </button>

      <span className="text-[10px] text-canvas/40 ml-1.5 border-l border-white/20 pl-2">
        Press [D]
      </span>
    </div>
  );
};
