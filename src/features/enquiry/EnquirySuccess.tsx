import React from 'react';
import { SiteVisitEnquiry } from '../../types/enquiry';
import { Button } from '../../shared/ui/Button';
import { formatINR } from '../../lib/utils';
import { CheckCircle2, Calendar, MapPin, Sparkles, Copy, Check } from 'lucide-react';

interface EnquirySuccessProps {
  enquiry: SiteVisitEnquiry;
  onClose: () => void;
}

export const EnquirySuccess: React.FC<EnquirySuccessProps> = ({
  enquiry,
  onClose,
}) => {
  const [copied, setCopied] = React.useState<boolean>(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(enquiry.shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-2 space-y-5 text-center">
      {/* Success Badge & Headline */}
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-status-availableBg text-status-available flex items-center justify-center mb-3">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-semibold text-ink-primary">
          Site Visit Scheduled
        </h3>
        <p className="text-xs text-ink-muted mt-1 max-w-sm">
          Thank you, <strong className="text-ink-primary">{enquiry.customerName}</strong>. Our residential host has reserved your private tour.
        </p>
      </div>

      {/* Appointment Ticket Card */}
      <div className="bg-canvas-subtle p-4 rounded-lg border border-canvas-muted text-left text-xs space-y-3">
        <div className="flex justify-between items-center border-b border-canvas-muted pb-2">
          <span className="font-mono text-[11px] text-ink-muted uppercase">
            Pass Reference: #{enquiry.id.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 rounded bg-status-availableBg text-status-available font-semibold text-[10px]">
            CONFIRMED
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-ink-secondary">
          <div className="flex items-start gap-2">
            <Calendar className="w-3.5 h-3.5 text-accent-terracotta shrink-0 mt-0.5" />
            <div>
              <div className="text-ink-muted text-[11px]">Appointment Slot</div>
              <strong className="text-ink-primary">
                {enquiry.preferredDate} · {enquiry.timeSlot}
              </strong>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent-terracotta shrink-0 mt-0.5" />
            <div>
              <div className="text-ink-muted text-[11px]">Site Experience Center</div>
              <strong className="text-ink-primary">
                Aarohan Gallery, Sevasi-Bhayli
              </strong>
            </div>
          </div>
        </div>

        {/* Attached Custom Design Summary */}
        <div className="pt-2 border-t border-canvas-muted/70 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-ink-primary font-medium">
            <Sparkles className="w-3.5 h-3.5 text-accent-brass" />
            <span>Unit {enquiry.flatCode} ({enquiry.flatType.replace('_', ' ')})</span>
          </div>
          <div className="font-mono font-semibold text-accent-terracotta">
            {formatINR(enquiry.estimatedPrice)}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyLink}
          icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          className="w-full sm:w-auto"
        >
          <span>{copied ? 'Link Copied' : 'Copy Design Link'}</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onClose}
          className="w-full sm:w-auto"
        >
          Return to 3D Experience
        </Button>
      </div>
    </div>
  );
};
