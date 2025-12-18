'use client';

import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  MousePointer,
  Plus,
  Trash2,
  Undo2,
  Redo2,
} from 'lucide-react';

interface CanvasToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitToScreen: () => void;
  tool: 'select' | 'pan';
  onToolChange: (tool: 'select' | 'pan') => void;
  onAddEntity?: () => void;
  onDelete?: () => void;
  hasSelection?: boolean;
}

export default function CanvasToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitToScreen,
  tool,
  onToolChange,
  onAddEntity,
  onDelete,
  hasSelection,
}: CanvasToolbarProps) {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2">
      {/* Tool selection */}
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-1 flex flex-col gap-1 shadow-sm">
        <button
          onClick={() => onToolChange('select')}
          className={`toolbar-btn ${tool === 'select' ? 'active' : ''}`}
          title="Select (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          onClick={() => onToolChange('pan')}
          className={`toolbar-btn ${tool === 'pan' ? 'active' : ''}`}
          title="Pan (H)"
        >
          <Hand className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom controls */}
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-1 flex flex-col gap-1 shadow-sm">
        <button
          onClick={onZoomIn}
          className="toolbar-btn"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomReset}
          className="toolbar-btn text-xs font-mono w-8 h-8 flex items-center justify-center"
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={onZoomOut}
          className="toolbar-btn"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="border-t border-light-border dark:border-dark-border my-1" />
        <button
          onClick={onFitToScreen}
          className="toolbar-btn"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Entity Actions */}
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-1 flex flex-col gap-1 shadow-sm">
        {onAddEntity && (
          <button
            onClick={onAddEntity}
            className="toolbar-btn bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary"
            title="Add Entity"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            disabled={!hasSelection}
            className={`toolbar-btn ${
              hasSelection
                ? 'text-red-500 hover:bg-red-500/20'
                : 'opacity-40 cursor-not-allowed'
            }`}
            title="Delete Selected (Del)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* History (Undo/Redo) - Disabled for now */}
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-1 flex flex-col gap-1 shadow-sm">
        <button
          disabled
          className="toolbar-btn opacity-40 cursor-not-allowed"
          title="Undo (Coming Soon)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          disabled
          className="toolbar-btn opacity-40 cursor-not-allowed"
          title="Redo (Coming Soon)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
