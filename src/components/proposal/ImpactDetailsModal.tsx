'use client';

import { ModificationProposal, getChangeIcon, getChangeColor, getImpactColor } from '@/types/proposal';
import { X, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react';

interface ImpactDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ModificationProposal;
}

export default function ImpactDetailsModal({
  isOpen,
  onClose,
  proposal,
}: ImpactDetailsModalProps) {
  if (!isOpen) return null;

  const { impactSummary, changes, warnings, suggestions } = proposal;
  const hasBreakingChanges = impactSummary.breakingChanges.length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] mx-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-light-border dark:border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Impact Analysis
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Detailed breakdown of proposed changes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4 p-6 border-b border-light-border dark:border-dark-border">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {impactSummary.entitiesAffected}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {impactSummary.entitiesAffected === 1 ? 'Entity' : 'Entities'} Affected
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {impactSummary.attributesAffected}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                {impactSummary.attributesAffected === 1 ? 'Attribute' : 'Attributes'} Affected
              </div>
            </div>
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {impactSummary.relationshipsAffected}
              </div>
              <div className="text-sm text-amber-700 dark:text-amber-300">
                {impactSummary.relationshipsAffected === 1 ? 'Relationship' : 'Relationships'} Affected
              </div>
            </div>
          </div>

          {/* Breaking changes */}
          {hasBreakingChanges && (
            <div className="p-6 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-700 dark:text-red-400">Breaking Changes</h3>
              </div>
              <div className="space-y-2">
                {impactSummary.breakingChanges.map((change, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg"
                  >
                    <p className="text-sm text-red-700 dark:text-red-300">{change}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed changes */}
          <div className="p-6 border-b border-light-border dark:border-dark-border">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">All Changes</h3>
            <div className="space-y-3">
              {changes.map((change, index) => (
                <div
                  key={index}
                  className="p-4 bg-light-card dark:bg-dark-bg rounded-xl border border-light-border dark:border-dark-border"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`font-mono text-xl font-bold ${getChangeColor(change.type)}`}
                    >
                      {getChangeIcon(change.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {change.description}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${getImpactColor(change.impact)} bg-opacity-10`}
                        >
                          {change.impact} impact
                        </span>
                      </div>
                      {change.entityName && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Target: {change.entityName}
                          {change.attributeName && ` → ${change.attributeName}`}
                        </p>
                      )}

                      {/* Before/After comparison */}
                      {(change.details.before || change.details.after) && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {change.details.before && (
                            <div className="p-2 bg-red-50 dark:bg-red-900/10 rounded-lg">
                              <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                                Before
                              </div>
                              <pre className="text-xs text-red-700 dark:text-red-300 overflow-x-auto">
                                {JSON.stringify(change.details.before, null, 2)}
                              </pre>
                            </div>
                          )}
                          {change.details.after && (
                            <div className="p-2 bg-green-50 dark:bg-green-900/10 rounded-lg">
                              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                                After
                              </div>
                              <pre className="text-xs text-green-700 dark:text-green-300 overflow-x-auto">
                                {JSON.stringify(change.details.after, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="p-6 border-b border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-amber-700 dark:text-amber-400">Warnings</h3>
              </div>
              <div className="space-y-2">
                {warnings.map((warning, index) => (
                  <div
                    key={index}
                    className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg"
                  >
                    <p className="text-sm text-amber-700 dark:text-amber-300">{warning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-blue-700 dark:text-blue-400">Suggestions</h3>
              </div>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg"
                  >
                    <p className="text-sm text-blue-700 dark:text-blue-300">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary-dark rounded-lg transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
