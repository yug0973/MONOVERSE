import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Modal } from '../../shared/ui/Modal';
import { Button } from '../../shared/ui/Button';
import { Copy, Check, Share2, Sparkles } from 'lucide-react';
import { getFlatById } from '../../data/buildingData';

interface ShareConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareConfigModal: React.FC<ShareConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { getShareUrl, selectedFlatId, customization } = useAppStore();
  const [copied, setCopied] = useState<boolean>(false);

  const shareUrl = getShareUrl();
  const flat = selectedFlatId ? getFlatById(selectedFlatId) : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.getElementById('share-url-input') as HTMLInputElement;
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Configured Residence"
      subtitle="Anyone opening this permanent link will load this exact flat, finishes, and lighting."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Specification summary chips */}
        <div className="p-3.5 bg-canvas-subtle rounded border border-canvas-muted text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-ink-primary mb-1">
            <Sparkles className="w-3.5 h-3.5 text-accent-terracotta" />
            <span>Design Snapshot</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-ink-secondary">
            <div>
              <span className="text-ink-muted">Residence: </span>
              <strong>Unit {flat?.code || '1201'}</strong> ({flat?.type.replace('_', ' ')})
            </div>
            <div>
              <span className="text-ink-muted">Wall Palette: </span>
              <strong>{customization.globalWallColor.replace('_', ' ')}</strong>
            </div>
            <div>
              <span className="text-ink-muted">Flooring: </span>
              <strong>{customization.flooring.replace('_', ' ')}</strong>
            </div>
            <div>
              <span className="text-ink-muted">Furniture: </span>
              <strong>{customization.furniturePackage}</strong>
            </div>
          </div>
        </div>

        {/* Input with Copy Button */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
            Shareable URL
          </label>
          <div className="flex items-center gap-2">
            <input
              id="share-url-input"
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 text-xs font-mono p-2.5 rounded bg-canvas border border-canvas-muted text-ink-primary select-all focus:outline-none"
            />
            <Button
              variant={copied ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleCopy}
              icon={copied ? <Check className="w-3.5 h-3.5 text-status-available" /> : <Copy className="w-3.5 h-3.5" />}
            >
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </Button>
          </div>
        </div>

        {/* Action footnote */}
        <div className="flex items-center justify-between text-xs text-ink-muted pt-2 border-t border-canvas-muted">
          <span className="flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" />
            <span>State persisted in URL parameters</span>
          </span>
          <button
            onClick={onClose}
            className="text-xs font-medium text-ink-secondary hover:text-ink-primary underline"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
