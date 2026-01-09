'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModificationProposal, getChangeIcon, getChangeColor } from '@/types/proposal';
import { Bot, X, Eye, Check, AlertTriangle, ChevronDown, ChevronUp, Download } from 'lucide-react';

interface ActionPreviewCardProps {
  proposal: ModificationProposal;
  onProceed: () => void;
  onCancel: () => void;
  onShowImpact: () => void;
}

export default function ActionPreviewCard({
  proposal,
  onProceed,
  onCancel,
  onShowImpact,
}: ActionPreviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayChanges = isExpanded ? proposal.changes : proposal.changes.slice(0, 5);
  const hasMoreChanges = proposal.changes.length > 5;

  const { entitiesAffected, attributesAffected, relationshipsAffected } = proposal.impactSummary;

  // Export proposal as JSON
  const handleExportProposal = useCallback(() => {
    const exportData = {
      type: 'modification_proposal',
      exportedAt: new Date().toISOString(),
      originalMessage: proposal.originalMessage,
      explanation: proposal.explanation,
      changes: proposal.changes,
      impactSummary: proposal.impactSummary,
      warnings: proposal.warnings,
      suggestions: proposal.suggestions,
      rawChanges: proposal.rawChanges,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proposal-${proposal.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [proposal]);

  // Keyboard shortcuts for proposals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          onProceed();
          break;
        case 'Escape':
          e.preventDefault();
          onCancel();
          break;
        case 'i':
        case 'I':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onShowImpact();
          }
          break;
        case 'e':
        case 'E':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleExportProposal();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onProceed, onCancel, onShowImpact, handleExportProposal]);

  return (
    <div className="bg-white dark:bg-dark-card border-2 border-accent-primary/30 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-accent-primary/5 dark:bg-accent-primary/10 border-b border-accent-primary/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-accent-primary" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">AI Proposal</span>
        </div>
        <span className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
          PENDING
        </span>
      </div>

      {/* Explanation */}
      <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
        <p className="text-sm text-gray-700 dark:text-gray-300">{proposal.explanation}</p>
      </div>

      {/* Changes list */}
      <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Proposed Changes
        </h4>
        <div className="space-y-1.5">
          {displayChanges.map((change, index) => (
            <div
              key={index}
              className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-light-hover dark:bg-dark-hover"
            >
              <span className={`font-mono text-lg font-bold leading-none ${getChangeColor(change.type)}`}>
                {getChangeIcon(change.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {change.description}
                </p>
                {change.entityName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {change.entityName}
                    {change.attributeName && ` → ${change.attributeName}`}
                  </p>
                )}
              </div>
              <span
                className={`px-1.5 py-0.5 text-xs rounded ${
                  change.impact === 'high'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : change.impact === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                }`}
              >
                {change.impact}
              </span>
            </div>
          ))}
        </div>

        {/* Show more/less button */}
        {hasMoreChanges && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 mt-2 text-xs text-accent-primary hover:text-accent-primary-dark"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show {proposal.changes.length - 5} more
              </>
            )}
          </button>
        )}
      </div>

      {/* Impact summary */}
      <div className="flex items-center gap-3 px-4 py-2 bg-light-card dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Impact:</span>
        <div className="flex items-center gap-2 text-xs">
          {entitiesAffected > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
              {entitiesAffected} {entitiesAffected === 1 ? 'entity' : 'entities'}
            </span>
          )}
          {attributesAffected > 0 && (
            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
              {attributesAffected} {attributesAffected === 1 ? 'attr' : 'attrs'}
            </span>
          )}
          {relationshipsAffected > 0 && (
            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
              {relationshipsAffected} {relationshipsAffected === 1 ? 'rel' : 'rels'}
            </span>
          )}
        </div>
      </div>

      {/* Warnings */}
      {proposal.warnings.length > 0 && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              {proposal.warnings.map((warning, index) => (
                <p key={index} className="text-xs text-amber-700 dark:text-amber-300">
                  {warning}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-light-card dark:bg-dark-bg">
        {/* Left side - Export button */}
        <button
          onClick={handleExportProposal}
          className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
          title="Export as JSON (E)"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
            title="Cancel (Esc)"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={onShowImpact}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            title="Show Impact Details (I)"
          >
            <Eye className="w-4 h-4" />
            Show Impact
          </button>
          <button
            onClick={onProceed}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary-dark rounded-lg transition-colors"
            title="Proceed with changes (Enter)"
          >
            <Check className="w-4 h-4" />
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
