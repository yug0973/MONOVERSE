import React, { useState } from 'react';
import { SiteVisitEnquiry } from '../../types/enquiry';
import { formatINR } from '../../lib/utils';
import { ExternalLink, Phone, Calendar, Clock } from 'lucide-react';

interface LeadRowProps {
  lead: SiteVisitEnquiry;
  onStatusChange: (id: string, status: SiteVisitEnquiry['status']) => void;
}

export const LeadRow: React.FC<LeadRowProps> = ({ lead, onStatusChange }) => {
  const [currentStatus, setCurrentStatus] = useState<SiteVisitEnquiry['status']>(lead.status);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as SiteVisitEnquiry['status'];
    setCurrentStatus(newStatus);
    onStatusChange(lead.id, newStatus);
  };

  const getStatusColor = (st: SiteVisitEnquiry['status']) => {
    switch (st) {
      case 'NEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CONTACTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ARCHIVED':
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <tr className="hover:bg-canvas-subtle/40 transition-colors text-xs border-b border-canvas-muted">
      {/* Customer Info */}
      <td className="py-3.5 px-4 font-medium text-ink-primary">
        <div>{lead.customerName}</div>
        <div className="flex items-center gap-1.5 text-[11px] text-ink-muted font-mono mt-0.5">
          <Phone className="w-3 h-3 text-ink-muted" />
          <span>+91 {lead.phoneNumber}</span>
        </div>
      </td>

      {/* Residence Specs & Pricing */}
      <td className="py-3.5 px-4">
        <div className="font-semibold text-ink-primary">
          Unit {lead.flatCode} ({lead.flatType.replace('_', ' ')})
        </div>
        <div className="text-[11px] text-ink-muted font-mono">
          Floor {lead.floorNumber} · {formatINR(lead.estimatedPrice)}
        </div>
      </td>

      {/* Appointment Slot */}
      <td className="py-3.5 px-4 text-ink-secondary">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-accent-terracotta" />
          <span>{lead.preferredDate}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-ink-muted mt-0.5">
          <Clock className="w-3 h-3 text-ink-muted" />
          <span>{lead.timeSlot}</span>
        </div>
      </td>

      {/* Lead Status Dropdown */}
      <td className="py-3.5 px-4">
        <select
          value={currentStatus}
          onChange={handleSelectChange}
          className={`text-[11px] font-semibold py-1 px-2 rounded border focus:outline-none ${getStatusColor(
            currentStatus
          )}`}
        >
          <option value="NEW">NEW LEAD</option>
          <option value="CONTACTED">CONTACTED</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </td>

      {/* Action: Open Saved Custom 3D Design */}
      <td className="py-3.5 px-4 text-right">
        <a
          href={lead.shareableUrl}
          className="inline-flex items-center gap-1 text-xs font-medium text-accent-terracotta hover:text-accent-terracotta-hover px-2.5 py-1 rounded hover:bg-accent-terracotta/10 transition-colors"
          title="Open configured flat in 3D"
        >
          <span>Open Design</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </td>
    </tr>
  );
};
