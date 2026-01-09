'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { Entity, Relationship } from '@/types/model';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface MiniMapProps {
  entities: Entity[];
  relationships: Relationship[];
  zoom: number;
  pan: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  onNavigate: (pan: { x: number; y: number }) => void;
  selectedEntityId: string | null;
}

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 150;
const PADDING = 20;

export default function MiniMap({
  entities,
  relationships,
  zoom,
  pan,
  containerWidth,
  containerHeight,
  onNavigate,
  selectedEntityId,
}: MiniMapProps) {
  const miniMapRef = useRef<SVGSVGElement>(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Calculate bounds of all entities
  const bounds = useMemo(() => {
    if (entities.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 800, width: 1000, height: 800 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    entities.forEach((entity) => {
      minX = Math.min(minX, entity.x);
      minY = Math.min(minY, entity.y);
      maxX = Math.max(maxX, entity.x + entity.width);
      maxY = Math.max(maxY, entity.y + entity.height);
    });

    // Add padding
    minX -= PADDING;
    minY -= PADDING;
    maxX += PADDING;
    maxY += PADDING;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }, [entities]);

  // Calculate scale to fit content in minimap
  const scale = useMemo(() => {
    const scaleX = (MINIMAP_WIDTH - 10) / bounds.width;
    const scaleY = (MINIMAP_HEIGHT - 10) / bounds.height;
    return Math.min(scaleX, scaleY, 1);
  }, [bounds]);

  // Calculate viewport rectangle in minimap coordinates
  const viewport = useMemo(() => {
    // The visible area in world coordinates
    const viewX = -pan.x / zoom;
    const viewY = -pan.y / zoom;
    const viewWidth = containerWidth / zoom;
    const viewHeight = containerHeight / zoom;

    // Convert to minimap coordinates
    return {
      x: (viewX - bounds.minX) * scale + 5,
      y: (viewY - bounds.minY) * scale + 5,
      width: viewWidth * scale,
      height: viewHeight * scale,
    };
  }, [pan, zoom, containerWidth, containerHeight, bounds, scale]);

  // Handle click on minimap to navigate
  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const rect = miniMapRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert click to world coordinates
      const worldX = (clickX - 5) / scale + bounds.minX;
      const worldY = (clickY - 5) / scale + bounds.minY;

      // Calculate new pan to center on clicked point
      const newPan = {
        x: -(worldX * zoom - containerWidth / 2),
        y: -(worldY * zoom - containerHeight / 2),
      };

      onNavigate(newPan);
    },
    [scale, bounds, zoom, containerWidth, containerHeight, onNavigate]
  );

  // Handle drag on viewport rectangle
  const handleDrag = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const startPan = { ...pan };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = (moveEvent.clientX - startX) / scale;
        const dy = (moveEvent.clientY - startY) / scale;

        onNavigate({
          x: startPan.x - dx * zoom,
          y: startPan.y - dy * zoom,
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [pan, scale, zoom, onNavigate]
  );

  // Get entity category color
  const getEntityColor = (entity: Entity) => {
    if (entity.id === selectedEntityId) return '#6366f1'; // accent color
    switch (entity.category) {
      case 'standard': return '#3b82f6';
      case 'lookup': return '#10b981';
      case 'junction': return '#f59e0b';
      case 'view': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="absolute bottom-4 right-4 p-2 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
        title="Show minimap"
      >
        <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 right-4 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-light-card dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Overview</span>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-0.5 hover:bg-light-hover dark:hover:bg-dark-hover rounded transition-colors"
          title="Collapse minimap"
        >
          <Minimize2 className="w-3 h-3 text-gray-500" />
        </button>
      </div>

      {/* Minimap Canvas */}
      <svg
        ref={miniMapRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className="cursor-crosshair"
        onClick={handleClick}
      >
        {/* Background */}
        <rect
          width={MINIMAP_WIDTH}
          height={MINIMAP_HEIGHT}
          className="fill-gray-100 dark:fill-gray-900"
        />

        {/* Content group */}
        <g transform={`translate(5, 5)`}>
          {/* Relationships */}
          {relationships.map((rel) => {
            const source = entities.find((e) => e.id === rel.sourceEntityId);
            const target = entities.find((e) => e.id === rel.targetEntityId);
            if (!source || !target) return null;

            const x1 = (source.x + source.width / 2 - bounds.minX) * scale;
            const y1 = (source.y + source.height / 2 - bounds.minY) * scale;
            const x2 = (target.x + target.width / 2 - bounds.minX) * scale;
            const y2 = (target.y + target.height / 2 - bounds.minY) * scale;

            return (
              <line
                key={rel.id}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9ca3af"
                strokeWidth={0.5}
                opacity={0.5}
              />
            );
          })}

          {/* Entities */}
          {entities.map((entity) => {
            const x = (entity.x - bounds.minX) * scale;
            const y = (entity.y - bounds.minY) * scale;
            const width = Math.max(entity.width * scale, 4);
            const height = Math.max(entity.height * scale, 3);

            return (
              <rect
                key={entity.id}
                x={x}
                y={y}
                width={width}
                height={height}
                fill={getEntityColor(entity)}
                rx={1}
                opacity={entity.id === selectedEntityId ? 1 : 0.7}
              />
            );
          })}

          {/* Viewport indicator */}
          <rect
            x={viewport.x}
            y={viewport.y}
            width={Math.max(viewport.width, 10)}
            height={Math.max(viewport.height, 10)}
            fill="rgba(99, 102, 241, 0.1)"
            stroke="#6366f1"
            strokeWidth={1.5}
            strokeDasharray="3,2"
            rx={2}
            className="cursor-move"
            onMouseDown={handleDrag}
          />
        </g>
      </svg>

      {/* Zoom indicator */}
      <div className="px-2 py-1 text-xs text-center text-gray-500 dark:text-gray-400 border-t border-light-border dark:border-dark-border">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
