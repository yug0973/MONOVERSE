import React, { useState } from 'react';
import { ALL_FLATS } from '../../data/buildingData';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { formatINR } from '../../lib/utils';
import { FlatStatus } from '../../types/building';
import { ArrowUpRight } from 'lucide-react';

export const FlatTableView: React.FC = () => {
  const { showFloorPlanTable2D, setShowFloorPlanTable2D, selectFlat } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredFlats = ALL_FLATS.filter((flat) => {
    if (statusFilter !== 'ALL' && flat.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && flat.type !== typeFilter) return false;
    return true;
  });

  const handleSelectFlat = (flatId: string, status: FlatStatus) => {
    if (status === 'SOLD') return;
    selectFlat(flatId);
    setShowFloorPlanTable2D(false);
  };

  return (
    <Modal
      isOpen={showFloorPlanTable2D}
      onClose={() => setShowFloorPlanTable2D(false)}
      title="All Residences Directory"
      subtitle="Complete inventory list across G+14 residential floors with pricing and availability."
      maxWidth="4xl"
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-canvas-muted">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">Type:</span>
          {(['ALL', '2BHK', '3BHK', '3BHK_PREMIUM'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                typeFilter === t
                  ? 'bg-ink-primary text-canvas font-medium'
                  : 'bg-canvas-subtle text-ink-secondary hover:bg-canvas-muted'
              }`}
            >
              {t === 'ALL' ? 'All Types' : t.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">Status:</span>
          {(['ALL', 'AVAILABLE', 'HELD', 'SOLD'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                statusFilter === s
                  ? 'bg-ink-primary text-canvas font-medium'
                  : 'bg-canvas-subtle text-ink-secondary hover:bg-canvas-muted'
              }`}
            >
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse" aria-label="Residences inventory table">
          <thead>
            <tr className="border-b border-canvas-muted text-xs uppercase tracking-wider text-ink-muted bg-canvas-subtle/50">
              <th className="py-2.5 px-3">Unit</th>
              <th className="py-2.5 px-3">Floor</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Carpet Area</th>
              <th className="py-2.5 px-3">Facing</th>
              <th className="py-2.5 px-3">All-Inclusive Price</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-canvas-muted">
            {filteredFlats.map((flat) => {
              const isSold = flat.status === 'SOLD';
              return (
                <tr
                  key={flat.id}
                  className={`hover:bg-canvas-subtle/60 transition-colors ${
                    isSold ? 'opacity-50 bg-canvas-subtle/20' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-medium text-ink-primary">
                    Unit {flat.code} ({flat.unitNumber})
                  </td>
                  <td className="py-3 px-3 text-ink-secondary">Floor {flat.floorNumber}</td>
                  <td className="py-3 px-3">
                    <span className="font-serif font-medium">{flat.type.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 px-3 text-ink-secondary">{flat.carpetAreaSqFt} sq ft</td>
                  <td className="py-3 px-3 text-ink-muted">{flat.facing}</td>
                  <td className="py-3 px-3 font-medium text-ink-primary">
                    {formatINR(flat.totalPrice)}
                  </td>
                  <td className="py-3 px-3">
                    <Badge status={flat.status} dot size="sm">
                      {flat.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      disabled={isSold}
                      onClick={() => handleSelectFlat(flat.id, flat.status)}
                      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${
                        isSold
                          ? 'text-ink-muted cursor-not-allowed'
                          : 'text-accent-terracotta hover:bg-accent-terracotta/10'
                      }`}
                    >
                      <span>Explore</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};
