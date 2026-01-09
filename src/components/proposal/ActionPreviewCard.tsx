'use client';

import { useState, useEffect } from 'react';
import { ModificationProposal, getChangeIcon, getChangeColor } from '@/types/proposal';
import { Bot, X, Eye, Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

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
  const displayChanges = isExpanded ? proposal.changes : proposal.changes.slice(0, 3);
  const hasMoreChanges = proposal.changes.length > 3;

  const { entitiesAffected, attributesAffected, relationshipsAffected } = proposal.impactSummary;

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onProceed, onCancel, onShowImpact]);

  return (
    <div className="bg-white dark:bg-dark-card border-2 border-accent-primary/30 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-accent-primary/5 dark:bg-accent-primary/10 border-b border-accent-primary/20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-accent-primary" />
          </div>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">AI Proposal</span>
        </div>
        <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
          PENDING
        </span>
      </div>

      {/* Explanation */}
      <div className="px-3 py-2 border-b border-light-border dark:border-dark-border">
        <p className="text-sm text-gray-700 dark:text-gray-300">{proposal.explanation}</p>
      </div>

      {/* Changes list - compact */}
      <div className="px-3 py-2 border-b border-light-border dark:border-dark-border">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
          Changes ({proposal.changes.length})
        </h4>
        <div className="space-y-1">
          {displayChanges.map((change, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-2 py-1 rounded bg-light-hover dark:bg-dark-hover"
            >
              <span className={`font-mono font-bold ${getChangeColor(change.type)}`}>
                {getChangeIcon(change.type)}
              </span>
              <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">
                {change.description}
              </span>
            </div>
          ))}
        </div>

        {/* Show more/less button */}
        {hasMoreChanges && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 mt-1.5 text-xs text-accent-primary hover:text-accent-primary-dark"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                +{proposal.changes.length - 3} more
              </>
            )}
          </button>
        )}
      </div>

      {/* Impact summary - compact */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 bg-light-card dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
        <span className="text-xs text-gray-500 dark:text-gray-400">Impact:</span>
        {entitiesAffected > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
            {entitiesAffected} ent
          </span>
        )}
        {attributesAffected > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
            {attributesAffected} attr
          </span>
        )}
        {relationshipsAffected > 0 && (
          <span className="px-1.5 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
            {relationshipsAffected} rel
          </span>
        )}
      </div>

      {/* Warnings - compact */}
      {proposal.warnings.length > 0 && (
        <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300 line-clamp-2">
              {proposal.warnings[0]}
              {proposal.warnings.length > 1 && ` (+${proposal.warnings.length - 1} more)`}
            </p>
          </div>
        </div>
      )}

      {/* Actions - PROMINENT ACCEPT BUTTON */}
      <div className="p-3 bg-light-card dark:bg-dark-bg space-y-2">
        {/* Primary action - Accept button - FULL WIDTH */}
        <button
          onClick={onProceed}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-accent-primary hover:bg-accent-primary-dark rounded-lg transition-colors shadow-sm"
          title="Accept changes (Enter)"
        >
          <Check className="w-4 h-4" />
          Accept Changes
        </button>

        {/* Secondary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            title="Cancel (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            onClick={onShowImpact}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            title="Show details (I)"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
