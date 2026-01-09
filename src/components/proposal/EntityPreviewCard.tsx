'use client';

import { useState } from 'react';
import { EntityPreview } from '@/types/proposal';
import { Check, Info, Table2, BookOpen, Link2, Eye } from 'lucide-react';

interface EntityPreviewCardProps {
  entity: EntityPreview;
  isSelected: boolean;
  onToggle: () => void;
  compact?: boolean;
}

const categoryIcons = {
  standard: Table2,
  lookup: BookOpen,
  junction: Link2,
  view: Eye,
};

const categoryColors = {
  standard: 'bg-accent-primary',
  lookup: 'bg-amber-500',
  junction: 'bg-purple-500',
  view: 'bg-emerald-500',
};

const categoryLabels = {
  standard: 'Table',
  lookup: 'Lookup',
  junction: 'Junction',
  view: 'View',
};

export default function EntityPreviewCard({
  entity,
  isSelected,
  onToggle,
  compact = false,
}: EntityPreviewCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const CategoryIcon = categoryIcons[entity.category] || Table2;
  const categoryColor = categoryColors[entity.category] || categoryColors.standard;

  if (compact) {
    return (
      <button
        onClick={onToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
          isSelected
            ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
            : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        <div className={`w-2 h-2 rounded-full ${categoryColor}`} />
        <span className="text-sm font-medium">{entity.name}</span>
        {isSelected && <Check className="w-4 h-4 ml-1" />}

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 whitespace-nowrap">
            <div className="font-medium mb-1">{entity.name}</div>
            <div className="text-gray-300">{entity.description || 'No description'}</div>
            <div className="text-gray-400 mt-1">~{entity.estimatedAttributeCount} columns</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
          </div>
        )}
      </button>
    );
  }

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`relative cursor-pointer rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-accent-primary bg-accent-primary/5 dark:bg-accent-primary/10'
          : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-t-lg ${categoryColor} bg-opacity-10`}>
        <CategoryIcon className={`w-4 h-4 ${isSelected ? 'text-accent-primary' : 'text-gray-500'}`} />
        <span className={`text-sm font-semibold flex-1 ${isSelected ? 'text-accent-primary' : 'text-gray-800 dark:text-gray-200'}`}>
          {entity.name}
        </span>
        <div
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-accent-primary border-accent-primary'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <span className={`px-1.5 py-0.5 rounded ${categoryColor} bg-opacity-20 text-gray-700 dark:text-gray-300`}>
            {categoryLabels[entity.category]}
          </span>
          <span>•</span>
          <span>~{entity.estimatedAttributeCount} columns</span>
        </div>
        {entity.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
            {entity.description}
          </p>
        )}
      </div>

      {/* Tooltip for more details */}
      {showTooltip && entity.description && entity.description.length > 60 && (
        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50 max-w-xs">
          <div className="font-medium mb-1">{entity.name}</div>
          <div className="text-gray-300">{entity.description}</div>
          <div className="absolute top-full left-4 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
        </div>
      )}
    </div>
  );
}
