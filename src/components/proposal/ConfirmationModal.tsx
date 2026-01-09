'use client';

import { X, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { ChangePreview } from '@/types/proposal';
import { getChangeIcon, getChangeColor } from '@/types/proposal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  changes?: ChangePreview[];
  entityCount?: number;
  attributeCount?: number;
  relationshipCount?: number;
  warnings?: string[];
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  changes = [],
  entityCount = 0,
  attributeCount = 0,
  relationshipCount = 0,
  warnings = [],
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const hasChanges = changes.length > 0;
  const hasSummary = entityCount > 0 || attributeCount > 0 || relationshipCount > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-accent-primary" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-gray-600 dark:text-gray-400">{description}</p>

          {/* Summary */}
          {hasSummary && (
            <div className="flex items-center gap-4 text-sm">
              {entityCount > 0 && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md">
                  {entityCount} {entityCount === 1 ? 'entity' : 'entities'}
                </span>
              )}
              {attributeCount > 0 && (
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md">
                  {attributeCount} {attributeCount === 1 ? 'attribute' : 'attributes'}
                </span>
              )}
              {relationshipCount > 0 && (
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-md">
                  {relationshipCount} {relationshipCount === 1 ? 'relationship' : 'relationships'}
                </span>
              )}
            </div>
          )}

          {/* Changes list */}
          {hasChanges && (
            <div className="max-h-48 overflow-y-auto space-y-1 border border-light-border dark:border-dark-border rounded-lg p-2">
              {changes.slice(0, 10).map((change, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-light-hover dark:hover:bg-dark-hover"
                >
                  <span className={`font-mono font-bold ${getChangeColor(change.type)}`}>
                    {getChangeIcon(change.type)}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {change.description}
                  </span>
                </div>
              ))}
              {changes.length > 10 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  ... and {changes.length - 10} more changes
                </div>
              )}
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  {warnings.map((warning, index) => (
                    <p key={index} className="text-sm text-amber-800 dark:text-amber-200">
                      {warning}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary-dark rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm & Apply
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
