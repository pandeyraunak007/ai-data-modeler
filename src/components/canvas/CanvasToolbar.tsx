'use client';

import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  MousePointer,
  Grid,
} from 'lucide-react';

interface CanvasToolbarProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitToScreen: () => void;
  tool: 'select' | 'pan';
  onToolChange: (tool: 'select' | 'pan') => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export default function CanvasToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitToScreen,
  tool,
  onToolChange,
  showGrid,
  onToggleGrid,
}: CanvasToolbarProps) {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2">
      {/* Tool selection */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-1 flex flex-col gap-1">
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
      <div className="bg-dark-card border border-dark-border rounded-lg p-1 flex flex-col gap-1">
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
        <div className="border-t border-dark-border my-1" />
        <button
          onClick={onFitToScreen}
          className="toolbar-btn"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* View options */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-1 flex flex-col gap-1">
        <button
          onClick={onToggleGrid}
          className={`toolbar-btn ${showGrid ? 'active' : ''}`}
          title="Toggle Grid"
        >
          <Grid className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
