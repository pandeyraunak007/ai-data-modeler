'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataModel } from '@/types/model';
import {
  X,
  Share2,
  Copy,
  Check,
  AlertTriangle,
  Link,
  Loader2,
} from 'lucide-react';
import {
  generateShareUrl,
  copyToClipboard,
  isModelTooLargeForUrl,
  estimateUrlSize,
} from '@/lib/shareUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: DataModel;
}

export default function ShareModal({ isOpen, onClose, model }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTooLarge, setIsTooLarge] = useState(false);

  // Generate share URL when modal opens
  useEffect(() => {
    if (isOpen && model) {
      setIsGenerating(true);
      setError(null);
      setIsCopied(false);

      // Check if model is too large
      const tooLarge = isModelTooLargeForUrl(model);
      setIsTooLarge(tooLarge);

      if (tooLarge) {
        setIsGenerating(false);
        setError(
          `This model is too large to share via URL (estimated ${Math.round(estimateUrlSize(model) / 1024)}KB). Consider exporting as JSON instead.`
        );
        return;
      }

      try {
        const url = generateShareUrl(model);
        setShareUrl(url);
      } catch (err) {
        setError('Failed to generate share URL');
      } finally {
        setIsGenerating(false);
      }
    }
  }, [isOpen, model]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!shareUrl) return;

    const success = await copyToClipboard(shareUrl);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [shareUrl]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const urlLength = shareUrl.length;
  const urlSizeKb = (urlLength / 1024).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share Model
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Share your model via URL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Model info */}
          <div className="p-4 bg-light-card dark:bg-dark-bg rounded-xl border border-light-border dark:border-dark-border">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              {model.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{model.entities.length} entities</span>
              <span>{model.relationships.length} relationships</span>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {isGenerating && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
            </div>
          )}

          {/* Share URL */}
          {!isGenerating && !isTooLarge && shareUrl && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Shareable Link
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="w-full pl-10 pr-4 py-2.5 bg-light-card dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                    />
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                      isCopied
                        ? 'bg-green-500 text-white'
                        : 'bg-accent-primary text-white hover:bg-accent-primary-dark'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  URL size: {urlSizeKb}KB • Anyone with this link can view and edit a copy of your model
                </p>
              </div>
            </>
          )}

          {/* Alternative for large models */}
          {isTooLarge && (
            <div className="p-4 bg-light-card dark:bg-dark-bg rounded-xl border border-light-border dark:border-dark-border">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Alternative: Export as JSON
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                For larger models, export as a JSON file and share it directly.
              </p>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(model, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${model.name.toLowerCase().replace(/\s+/g, '-')}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary-dark transition-colors text-sm font-medium"
              >
                Export JSON
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
