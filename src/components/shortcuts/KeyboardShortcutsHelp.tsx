'use client';

import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: 'Save model' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Ctrl', 'F'], description: 'Open search' },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
      { keys: ['Escape'], description: 'Close modal / Deselect' },
    ],
  },
  {
    title: 'Canvas Navigation',
    shortcuts: [
      { keys: ['Scroll'], description: 'Zoom in/out' },
      { keys: ['Drag'], description: 'Pan canvas' },
      { keys: ['Ctrl', '0'], description: 'Reset zoom to 100%' },
      { keys: ['Ctrl', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], description: 'Zoom out' },
    ],
  },
  {
    title: 'Entity Operations',
    shortcuts: [
      { keys: ['N'], description: 'Create new entity' },
      { keys: ['Delete'], description: 'Delete selected entity' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate selected entity' },
      { keys: ['Enter'], description: 'Edit selected entity' },
    ],
  },
  {
    title: 'Selection',
    shortcuts: [
      { keys: ['Click'], description: 'Select entity' },
      { keys: ['Ctrl', 'Click'], description: 'Multi-select entities' },
      { keys: ['Ctrl', 'A'], description: 'Select all entities' },
      { keys: ['Escape'], description: 'Clear selection' },
    ],
  },
  {
    title: 'AI Proposals',
    shortcuts: [
      { keys: ['Enter'], description: 'Accept proposal' },
      { keys: ['Escape'], description: 'Cancel proposal' },
      { keys: ['I'], description: 'Show impact details' },
      { keys: ['E'], description: 'Edit proposal prompt' },
    ],
  },
  {
    title: 'Export & Import',
    shortcuts: [
      { keys: ['Ctrl', 'E'], description: 'Export model' },
      { keys: ['Ctrl', 'I'], description: 'Import model' },
      { keys: ['Ctrl', 'Shift', 'E'], description: 'Export as image' },
    ],
  },
];

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
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
              <Keyboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Quick reference for all available shortcuts
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
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcutGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            {keyIndex > 0 && (
                              <span className="text-xs text-gray-400">+</span>
                            )}
                            <kbd className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-gray-700 dark:text-gray-300">
                              {key}
                            </kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">?</kbd> anytime to show this help
          </p>
        </div>
      </div>
    </div>
  );
}
