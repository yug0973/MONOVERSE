import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { Modal } from '../../shared/ui/Modal';
import { Button } from '../../shared/ui/Button';
import { PriceBreakdownCard } from './PriceBreakdownCard';
import { EmiCalculator } from './EmiCalculator';
import { PaymentStages } from './PaymentStages';
import { Receipt, Calculator, CalendarCheck, Calendar } from 'lucide-react';

interface PricingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PricingTab = 'breakdown' | 'emi' | 'schedule';

export const PricingDetailsModal: React.FC<PricingDetailsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedFlatId, openEnquiryModal } = useAppStore();
  const [activeTab, setActiveTab] = useState<PricingTab>('breakdown');

  const flat = selectedFlatId ? getFlatById(selectedFlatId) : getFlatById('flat-12-a');
  if (!flat) return null;

  const handleBookVisit = () => {
    onClose();
    openEnquiryModal();
  };

  const tabs: Array<{ id: PricingTab; label: string; icon: React.ReactNode }> = [
    { id: 'breakdown', label: 'Price Breakdown', icon: <Receipt className="w-3.5 h-3.5" /> },
    { id: 'emi', label: 'EMI Calculator', icon: <Calculator className="w-3.5 h-3.5" /> },
    { id: 'schedule', label: 'Payment Stages', icon: <CalendarCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Financial Suite — Unit ${flat.code}`}
      subtitle={`${flat.type.replace('_', ' ')} · Floor ${flat.floorNumber} · ${flat.carpetAreaSqFt} sq ft Carpet`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Segmented Tab Bar */}
        <div className="flex items-center gap-1 p-1 bg-canvas-subtle rounded border border-canvas-muted">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-medium rounded transition-colors ${
                activeTab === tab.id
                  ? 'bg-canvas text-ink-primary shadow-soft'
                  : 'text-ink-muted hover:text-ink-primary'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="py-1">
          {activeTab === 'breakdown' && <PriceBreakdownCard flat={flat} />}
          {activeTab === 'emi' && <EmiCalculator totalPrice={flat.totalPrice} />}
          {activeTab === 'schedule' && <PaymentStages totalPrice={flat.totalPrice} />}
        </div>

        {/* Footer CTA */}
        <div className="pt-3 border-t border-canvas-muted flex items-center justify-between gap-3">
          <div className="text-xs text-ink-muted hidden sm:block">
            Prices fixed per RERA stage. No hidden brokerage.
          </div>
          <Button
            variant="terracotta"
            size="md"
            onClick={handleBookVisit}
            icon={<Calendar className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Book Site Visit for this Flat
          </Button>
        </div>
      </div>
    </Modal>
  );
};
