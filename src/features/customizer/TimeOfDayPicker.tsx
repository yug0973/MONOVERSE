import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { TimeOfDay } from '../../types/customizer';
import { Sunrise, Sun, Sunset, Moon, Check } from 'lucide-react';

export const TimeOfDayPicker: React.FC = () => {
  const { customization, setTimeOfDay } = useAppStore();

  const timeOptions: Array<{
    id: TimeOfDay;
    title: string;
    sub: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'morning',
      title: 'Morning Sun',
      sub: '08:30 AM · Low East angles across sundeck',
      icon: <Sunrise className="w-4 h-4 text-accent-brass" />,
    },
    {
      id: 'noon',
      title: 'Midday Zenith',
      sub: '12:30 PM · Crisp natural overhead illumination',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'golden_hour',
      title: 'Golden Hour',
      sub: '05:45 PM · Long amber sunset rays across West corridor',
      icon: <Sunset className="w-4 h-4 text-accent-terracotta" />,
    },
    {
      id: 'night',
      title: 'Atmospheric Night',
      sub: '09:00 PM · Warm 2700K recessed interior spotlights',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
    },
  ];

  return (
    <div className="space-y-2.5">
      {timeOptions.map((opt) => {
        const isSelected = customization.timeOfDay === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => setTimeOfDay(opt.id)}
            className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all ${
              isSelected
                ? 'border-accent-terracotta bg-accent-terracotta/5 ring-1 ring-accent-terracotta shadow-soft'
                : 'border-canvas-muted bg-canvas-light hover:bg-canvas-subtle'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-canvas-subtle border border-canvas-muted">
                {opt.icon}
              </div>
              <div>
                <div className="text-xs font-medium text-ink-primary">
                  {opt.title}
                </div>
                <div className="text-[11px] text-ink-muted">
                  {opt.sub}
                </div>
              </div>
            </div>

            <div className="shrink-0 pl-2">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'border-accent-terracotta bg-accent-terracotta text-white'
                    : 'border-canvas-muted bg-canvas'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
