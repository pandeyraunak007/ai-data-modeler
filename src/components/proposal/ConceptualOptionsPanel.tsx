'use client';

import { useState, useMemo } from 'react';
import { GenerationProposal, ModelVariant, EntityPreview } from '@/types/proposal';
import EntityPreviewCard from './EntityPreviewCard';
import { X, Check, Sparkles, Loader2, ChevronRight, Minus, Plus } from 'lucide-react';

interface ConceptualOptionsPanelProps {
  proposal: GenerationProposal;
  onVariantSelect: (variantId: string) => void;
  onEntityToggle: (entityId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const complexityColors = {
  minimal: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  standard: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  comprehensive: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
};

const complexityLabels = {
  minimal: 'Minimal',
  standard: 'Standard',
  comprehensive: 'Comprehensive',
};

export default function ConceptualOptionsPanel({
  proposal,
  onVariantSelect,
  onEntityToggle,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConceptualOptionsPanelProps) {
  const selectedVariant = useMemo(
    () => proposal.variants.find((v) => v.id === proposal.selectedVariantId),
    [proposal.variants, proposal.selectedVariantId]
  );

  const selectedEntities = useMemo(() => {
    if (!selectedVariant) return [];
    return selectedVariant.entities.filter((e) => proposal.selectedEntityIds.includes(e.id));
  }, [selectedVariant, proposal.selectedEntityIds]);

  const allEntities = selectedVariant?.entities || [];
  const selectedCount = selectedEntities.length;
  const totalCount = allEntities.length;

  const handleSelectAll = () => {
    if (!selectedVariant) return;
    const allIds = selectedVariant.entities.map((e) => e.id);
    allIds.forEach((id) => {
      if (!proposal.selectedEntityIds.includes(id)) {
        onEntityToggle(id);
      }
    });
  };

  const handleDeselectAll = () => {
    if (!selectedVariant) return;
    const allIds = selectedVariant.entities.map((e) => e.id);
    allIds.forEach((id) => {
      if (proposal.selectedEntityIds.includes(id)) {
        onEntityToggle(id);
      }
    });
  };

  return (
    <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-dark-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-light-border dark:border-dark-border">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Choose Your Model Variant
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a variant and customize entities to include
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Variant tabs */}
      <div className="px-6 py-3 bg-light-card dark:bg-dark-bg border-b border-light-border dark:border-dark-border overflow-x-auto">
        <div className="flex gap-2">
          {proposal.variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => onVariantSelect(variant.id)}
              disabled={isLoading}
              className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all ${
                proposal.selectedVariantId === variant.id
                  ? 'border-accent-primary bg-accent-primary/5 dark:bg-accent-primary/10'
                  : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-gray-300 dark:hover:border-gray-600'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-sm font-semibold ${
                    proposal.selectedVariantId === variant.id
                      ? 'text-accent-primary'
                      : 'text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {variant.name}
                </span>
                {proposal.selectedVariantId === variant.id && (
                  <Check className="w-4 h-4 text-accent-primary" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full border ${complexityColors[variant.complexity]}`}
                >
                  {complexityLabels[variant.complexity]}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {variant.estimatedTables} tables
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected variant details */}
      {selectedVariant && (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Variant description */}
          <div className="px-6 py-3 border-b border-light-border dark:border-dark-border">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedVariant.description}
            </p>
            {selectedVariant.useCases.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Use cases:</span>
                {selectedVariant.useCases.slice(0, 3).map((useCase, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Entity selection toolbar */}
          <div className="flex items-center justify-between px-6 py-2 bg-light-card/50 dark:bg-dark-bg/50 border-b border-light-border dark:border-dark-border">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Entities ({selectedCount}/{totalCount})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                disabled={isLoading || selectedCount === totalCount}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-accent-primary hover:bg-accent-primary/10 rounded transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                disabled={isLoading || selectedCount === 0}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
                Deselect All
              </button>
            </div>
          </div>

          {/* Entity grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedVariant.entities.map((entity) => (
                <EntityPreviewCard
                  key={entity.id}
                  entity={entity}
                  isSelected={proposal.selectedEntityIds.includes(entity.id)}
                  onToggle={() => onEntityToggle(entity.id)}
                />
              ))}
            </div>

            {/* Relationships preview */}
            {selectedVariant.relationships.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Relationships
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVariant.relationships.map((rel) => {
                    const sourceEntity = selectedVariant.entities.find(
                      (e) => e.id === rel.sourceEntityId
                    );
                    const targetEntity = selectedVariant.entities.find(
                      (e) => e.id === rel.targetEntityId
                    );
                    const isActive =
                      proposal.selectedEntityIds.includes(rel.sourceEntityId) &&
                      proposal.selectedEntityIds.includes(rel.targetEntityId);

                    return (
                      <div
                        key={rel.id}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full border transition-opacity ${
                          isActive
                            ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary'
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 opacity-50'
                        }`}
                      >
                        <span>{sourceEntity?.name || '?'}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>{targetEntity?.name || '?'}</span>
                        <span className="text-[10px] opacity-70">
                          ({rel.sourceCardinality}:{rel.targetCardinality})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {selectedCount > 0
            ? `${selectedCount} ${selectedCount === 1 ? 'entity' : 'entities'} selected`
            : 'No entities selected'}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || selectedCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Model
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
