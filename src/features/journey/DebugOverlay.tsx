import React, { useState, useEffect } from 'react';

interface ClickPin {
  id: number;
  xPercent: number;
  yPercent: number;
  timestamp: string;
}

interface DebugOverlayProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  knownTargets?: Array<{
    id: string;
    label: string;
    xPercent: number;
    yPercent: number;
    color?: string;
  }>;
}

/**
 * Interactive Calibration Overlay for ?debug=1
 * - Clicking records exact percentage coordinates and logs to console
 * - Displays calibration reticles and floating coordinate inspector
 */
export const DebugOverlay: React.FC<DebugOverlayProps> = ({
  containerRef,
  knownTargets = [],
}) => {
  const [pins, setPins] = useState<ClickPin[]>([]);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Find bounding box from container if passed, or from window
      let rect: DOMRect;
      if (containerRef && containerRef.current) {
        rect = containerRef.current.getBoundingClientRect();
      } else {
        rect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
      }

      // Check if click was inside container
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }

      // Ignore clicks on buttons/inputs to avoid hijacking UI clicks
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea, [role="button"]')) {
        return;
      }

      const xPercent = parseFloat((((e.clientX - rect.left) / rect.width) * 100).toFixed(2));
      const yPercent = parseFloat((((e.clientY - rect.top) / rect.height) * 100).toFixed(2));
      const timestamp = new Date().toLocaleTimeString();

      const newPin: ClickPin = {
        id: Date.now(),
        xPercent,
        yPercent,
        timestamp,
      };

      setPins((prev) => [newPin, ...prev.slice(0, 5)]);

      console.group(`🎯 [CALIBRATION CLICK] ${timestamp}`);
      console.log(`xPercent: ${xPercent}%`);
      console.log(`yPercent: ${yPercent}%`);
      console.log(
        `Config Drop-in: { xPercent: ${xPercent}, yPercent: ${yPercent} }`
      );
      console.groupEnd();
    };

    const handleMouseMove = (e: MouseEvent) => {
      let rect: DOMRect;
      if (containerRef && containerRef.current) {
        rect = containerRef.current.getBoundingClientRect();
      } else {
        rect = new DOMRect(0, 0, window.innerWidth, window.innerHeight);
      }

      const xPercent = Math.max(
        0,
        Math.min(100, (((e.clientX - rect.left) / rect.width) * 100))
      );
      const yPercent = Math.max(
        0,
        Math.min(100, (((e.clientY - rect.top) / rect.height) * 100))
      );
      setCursorPos({
        x: parseFloat(xPercent.toFixed(1)),
        y: parseFloat(yPercent.toFixed(1)),
      });
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [containerRef]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-[9999] overflow-hidden select-none font-mono text-xs"
    >
      {/* Floating Status Pill */}
      <div className="absolute top-20 right-4 bg-ink-primary/95 text-canvas border border-accent-terracotta/60 rounded-md px-3 py-2 shadow-2xl backdrop-blur-md pointer-events-auto">
        <div className="flex items-center gap-2 font-bold text-accent-terracotta text-[11px] uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-accent-terracotta animate-pulse" />
          Debug Mode Active (?debug=1)
        </div>
        <div className="text-[11px] text-canvas/80 mt-1">
          Cursor:{' '}
          <span className="text-accent-brass font-bold">
            x: {cursorPos?.x ?? 0}% | y: {cursorPos?.y ?? 0}%
          </span>
        </div>
        <div className="text-[10px] text-canvas/50 mt-1">
          Click anywhere to log target coordinates
        </div>
      </div>

      {/* Render Known Targets (e.g. Hotspots & Zoom Targets) */}
      {knownTargets.map((target) => (
        <div
          key={target.id}
          style={{
            left: `${target.xPercent}%`,
            top: `${target.yPercent}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto group"
        >
          <div
            style={{ borderColor: target.color || '#B5654A' }}
            className="w-7 h-7 rounded-full border-2 border-dashed bg-black/40 flex items-center justify-center animate-spin"
            style-animation-duration="8s"
          >
            <div
              style={{ backgroundColor: target.color || '#B5654A' }}
              className="w-2 h-2 rounded-full"
            />
          </div>
          <div className="mt-1 px-1.5 py-0.5 rounded bg-black/85 text-white text-[10px] whitespace-nowrap shadow border border-white/20">
            {target.label}: {target.xPercent}% / {target.yPercent}%
          </div>
        </div>
      ))}

      {/* Render User Click Pins */}
      {pins.map((pin, idx) => (
        <div
          key={pin.id}
          style={{
            left: `${pin.xPercent}%`,
            top: `${pin.yPercent}%`,
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-fade-in pointer-events-none"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-red-500 animate-ping opacity-60 absolute" />
            <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold shadow-lg">
              {idx + 1}
            </div>
          </div>
          <div className="mt-1 px-2 py-0.5 rounded bg-red-950/90 text-white text-[10px] border border-red-500/80 shadow-md">
            x: {pin.xPercent}% | y: {pin.yPercent}%
          </div>
        </div>
      ))}
    </div>
  );
};
