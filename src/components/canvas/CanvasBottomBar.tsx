'use client';

import React from 'react';
import { LayoutGrid, GitBranch, Shuffle } from 'lucide-react';

interface CanvasBottomBarProps {
  onLayoutGrid: () => void;
  onLayoutSmart: () => void;
  onLayoutMinimize: () => void;
  disabled?: boolean;
}

export default function CanvasBottomBar({
  onLayoutGrid,
  onLayoutSmart,
  onLayoutMinimize,
  disabled = false,
}: CanvasBottomBarProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div
        className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl px-2 py-1.5 flex items-center gap-1 shadow-lg"
        role="toolbar"
        aria-label="Layout options"
      >
        {/* Grid Layout */}
        <button
          onClick={onLayoutGrid}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            disabled
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-light-hover dark:hover:bg-dark-hover'
          }`}
          title="Grid Layout - Arrange entities in rows (G)"
          aria-label="Apply grid layout"
        >
          <LayoutGrid className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Grid</span>
        </button>

        <div className="w-px h-6 bg-light-border dark:bg-dark-border" aria-hidden="true" />

        {/* Smart Layout */}
        <button
          onClick={onLayoutSmart}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            disabled
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-light-hover dark:hover:bg-dark-hover text-accent-primary'
          }`}
          title="Smart Layout - Group related entities together (L)"
          aria-label="Apply smart layout"
        >
          <GitBranch className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Smart</span>
        </button>

        <div className="w-px h-6 bg-light-border dark:bg-dark-border" aria-hidden="true" />

        {/* Minimize Crossings */}
        <button
          onClick={onLayoutMinimize}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            disabled
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-light-hover dark:hover:bg-dark-hover'
          }`}
          title="Minimize Crossings - Reduce line overlaps (M)"
          aria-label="Apply minimize crossings layout"
        >
          <Shuffle className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Tidy</span>
        </button>
      </div>
    </div>
  );
}
