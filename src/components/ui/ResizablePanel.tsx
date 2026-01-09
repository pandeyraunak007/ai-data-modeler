'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';

interface ResizablePanelProps {
  children: React.ReactNode;
  side: 'left' | 'right';
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  storageKey?: string;
  className?: string;
  collapsible?: boolean;
  collapsedWidth?: number;
  title?: string;
  icon?: React.ReactNode;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function ResizablePanel({
  children,
  side,
  defaultWidth,
  minWidth,
  maxWidth,
  storageKey,
  className = '',
  collapsible = false,
  collapsedWidth = 40,
  title,
  icon,
  isCollapsed: controlledIsCollapsed,
  onCollapsedChange,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Support both controlled and uncontrolled collapse state
  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalIsCollapsed;
  const setIsCollapsed = onCollapsedChange || setInternalIsCollapsed;

  // Load saved width and collapse state from localStorage
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedWidth = parseInt(saved, 10);
        if (!isNaN(savedWidth) && savedWidth >= minWidth && savedWidth <= maxWidth) {
          setWidth(savedWidth);
        }
      }
      // Load collapse state
      if (collapsible) {
        const savedCollapsed = localStorage.getItem(`${storageKey}-collapsed`);
        if (savedCollapsed === 'true') {
          setInternalIsCollapsed(true);
        }
      }
    }
  }, [storageKey, minWidth, maxWidth, collapsible]);

  // Save width to localStorage
  useEffect(() => {
    if (storageKey && !isResizing) {
      localStorage.setItem(storageKey, width.toString());
    }
  }, [width, storageKey, isResizing]);

  // Save collapse state to localStorage
  useEffect(() => {
    if (storageKey && collapsible) {
      localStorage.setItem(`${storageKey}-collapsed`, isCollapsed.toString());
    }
  }, [storageKey, collapsible, isCollapsed]);

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

  // Toggle collapse state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  // Collapsed view
  if (collapsible && isCollapsed) {
    return (
      <div
        className={`relative flex-shrink-0 ${className}`}
        style={{ width: collapsedWidth }}
      >
        <div className="h-full bg-light-card dark:bg-dark-card flex flex-col items-center py-4 border-l border-light-border dark:border-dark-border">
          {/* Expand button */}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors group"
            title={title ? `Show ${title}` : 'Expand panel'}
          >
            {side === 'right' ? (
              <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-accent-primary" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-accent-primary" />
            )}
          </button>

          {/* Icon if provided */}
          {icon && (
            <div className="mt-2 p-2 text-gray-400">
              {icon}
            </div>
          )}

          {/* Vertical title */}
          {title && (
            <div className="mt-4 flex-1 flex items-center">
              <span
                className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)',
                }}
              >
                {title}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

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

      {/* Content with collapse button injected */}
      <div className="h-full overflow-hidden">
        {collapsible ? (
          React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<any>, {
                onCollapse: toggleCollapse,
              });
            }
            return child;
          })
        ) : (
          children
        )}
      </div>
    </div>
  );
}
