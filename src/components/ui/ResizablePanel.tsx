'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizablePanelProps {
  children: React.ReactNode;
  side: 'left' | 'right';
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  storageKey?: string;
  className?: string;
}

export default function ResizablePanel({
  children,
  side,
  defaultWidth,
  minWidth,
  maxWidth,
  storageKey,
  className = '',
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Load saved width from localStorage
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedWidth = parseInt(saved, 10);
        if (!isNaN(savedWidth) && savedWidth >= minWidth && savedWidth <= maxWidth) {
          setWidth(savedWidth);
        }
      }
    }
  }, [storageKey, minWidth, maxWidth]);

  // Save width to localStorage
  useEffect(() => {
    if (storageKey && !isResizing) {
      localStorage.setItem(storageKey, width.toString());
    }
  }, [width, storageKey, isResizing]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      let newWidth: number;

      if (side === 'right') {
        // For right panels, calculate from the right edge
        newWidth = window.innerWidth - e.clientX;
      } else {
        // For left panels, calculate from the left edge
        newWidth = e.clientX - rect.left;
      }

      // Clamp to min/max
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(newWidth);
    },
    [isResizing, side, minWidth, maxWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={panelRef}
      className={`relative flex-shrink-0 ${className}`}
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 bottom-0 w-1 z-20 cursor-col-resize group ${
          side === 'right' ? 'left-0 -ml-0.5' : 'right-0 -mr-0.5'
        }`}
      >
        {/* Visual indicator */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${
            side === 'right' ? '-left-2' : '-right-2'
          } opacity-0 group-hover:opacity-100 transition-opacity`}
        >
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-md p-0.5 shadow-sm">
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
        </div>

        {/* Hover/active highlight */}
        <div
          className={`absolute inset-y-0 w-1 transition-colors ${
            isResizing
              ? 'bg-accent-primary'
              : 'bg-transparent hover:bg-accent-primary/50'
          }`}
        />
      </div>

      {/* Content */}
      <div className="h-full overflow-hidden">{children}</div>
    </div>
  );
}
