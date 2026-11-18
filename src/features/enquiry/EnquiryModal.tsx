import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getFlatById } from '../../data/buildingData';
import { api } from '../../api/client';
import { Modal } from '../../shared/ui/Modal';
import { Button } from '../../shared/ui/Button';
import { EnquirySuccess } from './EnquirySuccess';
import { validateIndianMobile, formatINR } from '../../lib/utils';
import { SiteVisitEnquiry } from '../../types/enquiry';
import { Calendar, User, Phone, Mail, Clock, MessageSquare, Sparkles } from 'lucide-react';

export const EnquiryModal: React.FC = () => {
  const {
    isEnquiryModalOpen,
    closeEnquiryModal,
    selectedFlatId,
    customization,
    getShareUrl,
  } = useAppStore();

  const flat = selectedFlatId ? getFlatById(selectedFlatId) : getFlatById('flat-12-a');

  // Form fields
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [date, setDate] = useState<string>('2026-11-25');
  const [timeSlot, setTimeSlot] = useState<string>('10:30 AM - 12:30 PM');
  const [message, setMessage] = useState<string>('');

  // States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<SiteVisitEnquiry | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || name.length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!validateIndianMobile(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9825012345).');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const savedEnquiry = await api.submitSiteVisitEnquiry({
        customerName: name.trim(),
        phoneNumber: phone.trim(),
        email: email.trim(),
        preferredDate: date,
        timeSlot,
        flatId: flat?.id || 'flat-12-a',
        flatCode: flat?.code || '1201',
        floorNumber: flat?.floorNumber || 12,
        flatType: flat?.type || '3BHK_PREMIUM',
        carpetAreaSqFt: flat?.carpetAreaSqFt || 1950,
        estimatedPrice: flat?.totalPrice || 16800000,
        customization,
        shareableUrl: getShareUrl(),
        message: message.trim() || undefined,
      });

      setSubmittedEnquiry(savedEnquiry);
    } catch {
      setErrorMsg('Unable to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedEnquiry(null);
    setErrorMsg(null);
    closeEnquiryModal();
  };

  return (
    <Modal
      isOpen={isEnquiryModalOpen}
      onClose={handleClose}
      title={submittedEnquiry ? undefined : 'Schedule Private Site Visit'}
      subtitle={
        submittedEnquiry
          ? undefined
          : 'Experience Aarohan Residences in person with our architectural concierge.'
      }
      maxWidth="md"
    >
      {submittedEnquiry ? (
        <EnquirySuccess enquiry={submittedEnquiry} onClose={handleClose} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Configured Flat Attached Summary */}
          {flat && (
            <div className="p-3 bg-canvas-subtle rounded border border-canvas-muted text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-terracotta shrink-0" />
                <div>
                  <strong className="text-ink-primary">Unit {flat.code} ({flat.unitNumber})</strong>
                  <div className="text-ink-muted">
                    {flat.type.replace('_', ' ')} · Floor {flat.floorNumber}
                  </div>
                </div>
              </div>
              <div className="font-mono font-semibold text-accent-terracotta">
                {formatINR(flat.totalPrice)}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded border border-red-200">
              {errorMsg}
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink-secondary flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-ink-muted" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rajiv Brahmbhatt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded bg-canvas-light border border-canvas-muted text-ink-primary focus:border-accent-terracotta focus:outline-none"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink-secondary flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-ink-muted" />
              <span>Mobile Number (+91)</span>
            </label>
            <input
              type="tel"
              required
              placeholder="98250 12345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-2.5 rounded bg-canvas-light border border-canvas-muted text-ink-primary focus:border-accent-terracotta focus:outline-none font-mono"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink-secondary flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-ink-muted" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              placeholder="rajiv@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-2.5 rounded bg-canvas-light border border-canvas-muted text-ink-primary focus:border-accent-terracotta focus:outline-none"
            />
          </div>

          {/* Date & Time Slot in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-secondary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                <span>Preferred Date</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2 rounded bg-canvas-light border border-canvas-muted text-ink-primary focus:border-accent-terracotta focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-ink-secondary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ink-muted" />
                <span>Time Slot</span>
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full text-xs p-2 rounded bg-canvas-light border border-canvas-muted text-ink-primary focus:border-accent-terracotta focus:outline-none"
              >
                <option value="10:30 AM - 12:30 PM">10:30 AM – Morning</option>
                <option value="02:30 PM - 04:30 PM">02:30 PM – Afternoon</option>
                <option value="05:00 PM - 07:00 PM">05:00 PM – Sunset Tour</option>
              </select>
            </div>
          </div>

          {/* Optional Message */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-ink-secondary flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-ink-muted" />
              <span>Notes or Preferences (Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Interested in high floor East-facing unit with morning sun..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs p-2.5 rounded bg-canvas-light border border-canvas-muted text-ink-primary focus:border-accent-terracotta focus:outline-none resize-none"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="terracotta"
              size="md"
              loading={isSubmitting}
              className="w-full"
            >
              Confirm Site Visit Reservation
            </Button>
            <p className="text-[11px] text-center text-ink-muted mt-2">
              No obligations. We never share your phone number with external brokers.
            </p>
          </div>
        </form>
      )}
    </Modal>
  );
};
