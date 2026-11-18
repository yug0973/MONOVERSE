import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { SiteVisitEnquiry } from '../../types/enquiry';
import { LeadRow } from './LeadRow';
import { formatINR } from '../../lib/utils';
import { Users, CalendarCheck, TrendingUp, ArrowLeft, Search, RefreshCw } from 'lucide-react';

interface AdminLeadsPageProps {
  onBack: () => void;
}

export const AdminLeadsPage: React.FC<AdminLeadsPageProps> = ({ onBack }) => {
  const [leads, setLeads] = useState<SiteVisitEnquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await api.getLeads();
      setLeads(data);
    } catch (e) {
      console.error('Failed to load leads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: SiteVisitEnquiry['status']
  ) => {
    await api.updateLeadStatus(id, status);
    setLeads((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  // Filter leads
  const filteredLeads = leads.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.customerName.toLowerCase().includes(q);
      const matchPhone = item.phoneNumber.includes(q);
      const matchUnit = item.flatCode.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchUnit) return false;
    }
    return true;
  });

  // Calculate CRM Pipeline Metrics
  const totalLeads = leads.length;
  const confirmedCount = leads.filter((l) => l.status === 'CONFIRMED').length;
  const totalPipelineValue = leads.reduce((acc, curr) => acc + curr.estimatedPrice, 0);

  return (
    <div className="min-h-screen bg-canvas text-ink-primary p-6 sm:p-10 pt-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-muted pb-6">
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-primary mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to 3D Experience</span>
            </button>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-ink-primary">
              Sales Concierge & Leads CRM
            </h1>
            <p className="text-xs text-ink-muted mt-1">
              Internal Builder Demonstration Portal · Aarohan Residences, Vadodara
            </p>
          </div>

          <button
            onClick={fetchLeads}
            disabled={loading}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded bg-canvas-subtle border border-canvas-muted text-xs font-medium text-ink-secondary hover:bg-canvas-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Leads</span>
          </button>
        </div>

        {/* CRM Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-lg bg-canvas-light border border-canvas-muted shadow-soft">
            <div className="flex items-center gap-2 text-ink-muted text-xs uppercase tracking-wider mb-2">
              <Users className="w-4 h-4 text-accent-terracotta" />
              <span>Total Inquiries</span>
            </div>
            <div className="font-serif text-3xl font-semibold text-ink-primary">
              {totalLeads}
            </div>
            <div className="text-[11px] text-ink-muted mt-1">Registered site visit requests</div>
          </div>

          <div className="p-5 rounded-lg bg-canvas-light border border-canvas-muted shadow-soft">
            <div className="flex items-center gap-2 text-ink-muted text-xs uppercase tracking-wider mb-2">
              <CalendarCheck className="w-4 h-4 text-status-available" />
              <span>Confirmed Visits</span>
            </div>
            <div className="font-serif text-3xl font-semibold text-status-available">
              {confirmedCount}
            </div>
            <div className="text-[11px] text-ink-muted mt-1">Ready for on-site hosted tours</div>
          </div>

          <div className="p-5 rounded-lg bg-canvas-light border border-canvas-muted shadow-soft">
            <div className="flex items-center gap-2 text-ink-muted text-xs uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4 text-accent-brass" />
              <span>Pipeline Value</span>
            </div>
            <div className="font-serif text-3xl font-semibold text-ink-primary">
              {formatINR(totalPipelineValue)}
            </div>
            <div className="text-[11px] text-ink-muted mt-1">Gross configured inventory value</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, phone, unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded bg-canvas-light border border-canvas-muted text-ink-primary focus:border-accent-terracotta focus:outline-none"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'NEW', 'CONTACTED', 'CONFIRMED', 'ARCHIVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-2.5 py-1.5 rounded transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-ink-primary text-canvas font-medium shadow-soft'
                    : 'bg-canvas-subtle text-ink-muted hover:text-ink-primary hover:bg-canvas-muted'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Table */}
        <div className="border border-canvas-muted rounded-lg bg-canvas-light shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-canvas-muted text-[11px] uppercase tracking-wider text-ink-muted bg-canvas-subtle/50">
                  <th className="py-3 px-4">Visitor Name & Phone</th>
                  <th className="py-3 px-4">Interested Residence</th>
                  <th className="py-3 px-4">Appointment Slot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Saved 3D Design</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-ink-muted">
                      No leads match your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
