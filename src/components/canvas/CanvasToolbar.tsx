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
  // Undo/Redo
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
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
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: CanvasToolbarProps) {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2">
      {/* Tool selection */}
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-1 flex flex-col gap-1 shadow-sm" role="toolbar" aria-label="Canvas tools">
        <button
          onClick={() => onToolChange('select')}
          className={`toolbar-btn ${tool === 'select' ? 'active' : ''}`}
          title="Select (V)"
          aria-label="Select tool"
          aria-pressed={tool === 'select'}
        >
          <MousePointer className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => onToolChange('pan')}
          className={`toolbar-btn ${tool === 'pan' ? 'active' : ''}`}
          title="Pan (H)"
          aria-label="Pan tool"
          aria-pressed={tool === 'pan'}
        >
          <Hand className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Zoom controls */}
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-1 flex flex-col gap-1 shadow-sm" role="group" aria-label="Zoom controls">
        <button
          onClick={onZoomIn}
          className="toolbar-btn"
          title="Zoom In (+)"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={onZoomReset}
          className="toolbar-btn text-xs font-mono w-8 h-8 flex items-center justify-center"
          title="Reset Zoom"
          aria-label={`Current zoom ${Math.round(zoom * 100)}%, click to reset`}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={onZoomOut}
          className="toolbar-btn"
          title="Zoom Out (-)"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" aria-hidden="true" />
        </button>
        <div className="border-t border-light-border dark:border-dark-border my-1" aria-hidden="true" />
        <button
          onClick={onFitToScreen}
          className="toolbar-btn"
          title="Fit to Screen"
          aria-label="Fit diagram to screen"
        >
          <Maximize2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Entity Actions */}
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-1 flex flex-col gap-1 shadow-sm" role="group" aria-label="Entity actions">
        {onAddEntity && (
          <button
            onClick={onAddEntity}
            className="toolbar-btn bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary"
            title="Add Entity"
            aria-label="Add new entity"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
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
            aria-label="Delete selected item"
            aria-disabled={!hasSelection}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* History (Undo/Redo) */}
      <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-1 flex flex-col gap-1 shadow-sm" role="group" aria-label="History controls">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`toolbar-btn ${
            canUndo
              ? 'hover:bg-light-hover dark:hover:bg-dark-hover'
              : 'opacity-40 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
          aria-label="Undo last action"
          aria-disabled={!canUndo}
        >
          <Undo2 className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`toolbar-btn ${
            canRedo
              ? 'hover:bg-light-hover dark:hover:bg-dark-hover'
              : 'opacity-40 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
          aria-label="Redo last action"
          aria-disabled={!canRedo}
        >
          <Redo2 className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
