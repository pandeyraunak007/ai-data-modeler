'use client';

import React, { useState } from 'react';
import { MODEL_TEMPLATES, ModelTemplate, generateModelFromTemplate } from '@/lib/templates';
import { X, Sparkles, Loader2, Table2 } from 'lucide-react';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: ReturnType<typeof generateModelFromTemplate>) => void;
}

const categoryColors = {
  business: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  technical: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  content: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  social: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
};

export default function TemplateSelector({ isOpen, onClose, onSelect }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | ModelTemplate['category']>('all');

  const filteredTemplates =
    filter === 'all' ? MODEL_TEMPLATES : MODEL_TEMPLATES.filter((t) => t.category === filter);

  const handleSelect = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    try {
      // Small delay for UX
      await new Promise((r) => setTimeout(r, 300));
      const model = generateModelFromTemplate(selectedTemplate);
      if (model) {
        onSelect(model);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[85vh] mx-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-light-border dark:border-dark-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Start from Template
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose a pre-built model to get started quickly
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

        {/* Filter tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg overflow-x-auto">
          {(['all', 'business', 'content', 'social'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                filter === cat
                  ? 'bg-accent-primary text-white'
                  : 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
              }`}
            >
              {cat === 'all' ? 'All Templates' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedTemplate === template.id
                    ? 'border-accent-primary bg-accent-primary/5 dark:bg-accent-primary/10'
                    : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-card hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                      {selectedTemplate === template.id && (
                        <span className="px-1.5 py-0.5 text-xs bg-accent-primary text-white rounded">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${categoryColors[template.category]}`}>
                    {template.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Table2 className="w-3 h-3" />
                    {template.entityCount} entities
                  </span>
                </div>

                {/* Preview */}
                <div className="flex flex-wrap gap-1">
                  {template.preview.slice(0, 5).map((entity) => (
                    <span
                      key={entity}
                      className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                    >
                      {entity}
                    </span>
                  ))}
                  {template.preview.length > 5 && (
                    <span className="px-2 py-0.5 text-xs text-gray-400">
                      +{template.preview.length - 5} more
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedTemplate
              ? `Selected: ${MODEL_TEMPLATES.find((t) => t.id === selectedTemplate)?.name}`
              : 'Select a template to continue'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedTemplate || isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Use Template
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
