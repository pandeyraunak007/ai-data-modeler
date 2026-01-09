'use client';

import React, { useState } from 'react';
import { useModel, HistoryEntry } from '@/context/ModelContext';
import {
  History,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Layers,
  Upload,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Undo2,
  Redo2,
  X,
} from 'lucide-react';

// Get icon for history entry type
function getTypeIcon(type: HistoryEntry['type']) {
  switch (type) {
    case 'add':
      return <Plus className="w-3.5 h-3.5 text-green-500" />;
    case 'modify':
      return <Pencil className="w-3.5 h-3.5 text-yellow-500" />;
    case 'delete':
      return <Trash2 className="w-3.5 h-3.5 text-red-500" />;
    case 'batch':
      return <Layers className="w-3.5 h-3.5 text-purple-500" />;
    case 'import':
      return <Upload className="w-3.5 h-3.5 text-blue-500" />;
    case 'generate':
      return <Sparkles className="w-3.5 h-3.5 text-accent-primary" />;
  }
}

// Format timestamp for display
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) {
    return 'Just now';
  } else if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m ago`;
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  } else {
    return date.toLocaleDateString();
  }
}

interface ChangeHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangeHistoryPanel({ isOpen, onClose }: ChangeHistoryPanelProps) {
  const { history, historyIndex, undo, redo, canUndo, canRedo, clearHistory } = useModel();
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-card w-full max-w-md max-h-[80vh] rounded-xl shadow-2xl border border-light-border dark:border-dark-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-light-border dark:border-dark-border bg-light-hover/50 dark:bg-dark-hover/50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-accent-primary" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Change History</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-hover px-2 py-0.5 rounded-full">
              {history.length} changes
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
            aria-label="Close history panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Undo/Redo Controls */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-light-border dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              canUndo
                ? 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
                : 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-dark-hover'
            }`}
          >
            <Undo2 className="w-4 h-4" />
            Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              canRedo
                ? 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
                : 'opacity-40 cursor-not-allowed bg-gray-100 dark:bg-dark-hover'
            }`}
          >
            <Redo2 className="w-4 h-4" />
            Redo
          </button>
          <div className="flex-1" />
          <button
            onClick={clearHistory}
            disabled={history.length === 0}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              history.length > 0
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'opacity-40 cursor-not-allowed'
            }`}
          >
            Clear All
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <History className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">No changes yet</p>
              <p className="text-xs mt-1">Your changes will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {[...history].reverse().map((entry, reverseIndex) => {
                const actualIndex = history.length - 1 - reverseIndex;
                const isCurrent = actualIndex === historyIndex;
                const isPast = actualIndex < historyIndex;
                const isExpanded = expandedEntries.has(entry.id);

                return (
                  <div
                    key={entry.id}
                    className={`px-4 py-3 transition-colors ${
                      isCurrent
                        ? 'bg-accent-primary/10 dark:bg-accent-primary/20 border-l-2 border-accent-primary'
                        : isPast
                        ? 'bg-gray-50 dark:bg-dark-hover/50 opacity-60'
                        : 'hover:bg-light-hover dark:hover:bg-dark-hover'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Type Icon */}
                      <div className="mt-0.5">{getTypeIcon(entry.type)}</div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {entry.description}
                          </p>
                          {isCurrent && (
                            <span className="text-xs bg-accent-primary text-white px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>

                        {/* Timestamp and affected items */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(entry.timestamp)}
                          </span>

                          {/* Affected items summary */}
                          {(entry.affectedItems.entities?.length ||
                            entry.affectedItems.relationships?.length ||
                            entry.affectedItems.attributes?.length) && (
                            <button
                              onClick={() => toggleExpanded(entry.id)}
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-accent-primary flex items-center gap-0.5"
                            >
                              {entry.affectedItems.entities?.length || 0} entities,{' '}
                              {entry.affectedItems.relationships?.length || 0} rels
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-2 pl-2 border-l-2 border-light-border dark:border-dark-border text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {entry.affectedItems.entities?.map(id => (
                              <div key={id} className="truncate">Entity: {id}</div>
                            ))}
                            {entry.affectedItems.relationships?.map(id => (
                              <div key={id} className="truncate">Relationship: {id}</div>
                            ))}
                            {entry.affectedItems.attributes?.map(attr => (
                              <div key={`${attr.entityId}-${attr.attributeId}`} className="truncate">
                                Attribute: {attr.attributeId}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-light-border dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Position: {historyIndex + 1} of {history.length} · Max {50} entries
          </p>
        </div>
      </div>
    </div>
  );
}
