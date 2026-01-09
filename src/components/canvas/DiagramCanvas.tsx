'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useModel } from '@/context/ModelContext';
import { Entity, Relationship, generateId, calculateEntityHeight, DEFAULT_ENTITY_WIDTH } from '@/types/model';
import EntityCard from './EntityCard';
import RelationshipLine from './RelationshipLine';
import CanvasToolbar from './CanvasToolbar';
import CanvasBottomBar from './CanvasBottomBar';
import EntityEditModal from './EntityEditModal';
import RelationshipEditModal from './RelationshipEditModal';
import { autoLayoutEntities, smartLayout, minimizeCrossings } from '@/lib/autoLayout';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export default function DiagramCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    model,
    selectedEntityId,
    selectedRelationshipId,
    selectEntity,
    selectRelationship,
    updateEntity,
    deleteEntity,
    addEntity,
    updateRelationship,
    deleteRelationship,
    addRelationship,
  } = useModel();

  // Edit modal state
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);

  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'select' | 'pan'>('select');

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'entity' | 'pan' | null>(null);
  const [dragEntityId, setDragEntityId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle zoom
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (!model || !containerRef.current || model.entities.length === 0) return;

    const container = containerRef.current.getBoundingClientRect();

    // Calculate bounding box of all entities
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    model.entities.forEach((e) => {
      minX = Math.min(minX, e.x);
      minY = Math.min(minY, e.y);
      maxX = Math.max(maxX, e.x + e.width);
      maxY = Math.max(maxY, e.y + e.height);
    });

    const contentWidth = maxX - minX + 100;
    const contentHeight = maxY - minY + 100;

    const scaleX = container.width / contentWidth;
    const scaleY = container.height / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 1);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setZoom(newZoom);
    setPan({
      x: container.width / 2 - centerX * newZoom,
      y: container.height / 2 - centerY * newZoom,
    });
  }, [model]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
    }
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;

      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      if (tool === 'pan') {
        setIsDragging(true);
        setDragType('pan');
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [tool, pan, zoom]
  );

  const handleEntityDragStart = useCallback(
    (entityId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (tool !== 'select') return;

      const entity = model?.entities.find((en) => en.id === entityId);
      if (!entity) return;

      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;

      setIsDragging(true);
      setDragType('entity');
      setDragEntityId(entityId);
      setDragOffset({ x: x - entity.x, y: y - entity.y });
      selectEntity(entityId);
    },
    [tool, model, pan, zoom, selectEntity]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      if (dragType === 'pan') {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      } else if (dragType === 'entity' && dragEntityId) {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (e.clientX - rect.left - pan.x) / zoom;
        const y = (e.clientY - rect.top - pan.y) / zoom;

        updateEntity(dragEntityId, {
          x: Math.max(0, x - dragOffset.x),
          y: Math.max(0, y - dragOffset.y),
        });
      }
    },
    [isDragging, dragType, dragStart, dragEntityId, dragOffset, pan, zoom, updateEntity]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    setDragEntityId(null);
  }, []);

  // Touch event handlers for mobile support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];

      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (tool === 'pan') {
        setIsDragging(true);
        setDragType('pan');
        setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
      }
    },
    [tool, pan]
  );

  const handleEntityTouchStart = useCallback(
    (entityId: string, e: React.TouchEvent) => {
      e.stopPropagation();
      if (tool !== 'select') return;
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      const entity = model?.entities.find((en) => en.id === entityId);
      if (!entity) return;

      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (touch.clientX - rect.left - pan.x) / zoom;
      const y = (touch.clientY - rect.top - pan.y) / zoom;

      setIsDragging(true);
      setDragType('entity');
      setDragEntityId(entityId);
      setDragOffset({ x: x - entity.x, y: y - entity.y });
      selectEntity(entityId);
    },
    [tool, model, pan, zoom, selectEntity]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];

      if (dragType === 'pan') {
        setPan({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        });
      } else if (dragType === 'entity' && dragEntityId) {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = (touch.clientX - rect.left - pan.x) / zoom;
        const y = (touch.clientY - rect.top - pan.y) / zoom;

        updateEntity(dragEntityId, {
          x: Math.max(0, x - dragOffset.x),
          y: Math.max(0, y - dragOffset.y),
        });
      }
    },
    [isDragging, dragType, dragStart, dragEntityId, dragOffset, pan, zoom, updateEntity]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
    setDragEntityId(null);
  }, []);

  // Handle click on canvas background to deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === svgRef.current || (e.target as HTMLElement).classList.contains('canvas-background')) {
        selectEntity(null);
        selectRelationship(null);
      }
    },
    [selectEntity, selectRelationship]
  );

  // Auto-layout handlers
  const handleAutoLayout = useCallback((algorithm: 'grid' | 'smart' | 'minimize') => {
    if (!model || model.entities.length === 0) return;

    let layoutedEntities: Entity[];

    switch (algorithm) {
      case 'grid':
        layoutedEntities = autoLayoutEntities(model.entities);
        break;
      case 'smart':
        layoutedEntities = smartLayout(model.entities, model.relationships);
        break;
      case 'minimize':
        layoutedEntities = minimizeCrossings(model.entities, model.relationships);
        break;
      default:
        return;
    }

    // Update all entity positions
    layoutedEntities.forEach(entity => {
      updateEntity(entity.id, { x: entity.x, y: entity.y });
    });

    // Fit to screen after layout with a small delay to allow state updates
    setTimeout(() => {
      handleFitToScreen();
    }, 100);
  }, [model, updateEntity, handleFitToScreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'v':
        case 'V':
          setTool('select');
          break;
        case 'h':
        case 'H':
          setTool('pan');
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
        case '0':
          handleZoomReset();
          break;
        case 'Delete':
        case 'Backspace':
          if (selectedEntityId) {
            deleteEntity(selectedEntityId);
            selectEntity(null);
          } else if (selectedRelationshipId) {
            deleteRelationship(selectedRelationshipId);
            selectRelationship(null);
          }
          break;
        case 'Enter':
          if (selectedEntityId) {
            const entity = model?.entities.find(e => e.id === selectedEntityId);
            if (entity) setEditingEntity(entity);
          } else if (selectedRelationshipId) {
            const rel = model?.relationships.find(r => r.id === selectedRelationshipId);
            if (rel) setEditingRelationship(rel);
          }
          break;
        // Layout shortcuts
        case 'l':
        case 'L':
          handleAutoLayout('smart');
          break;
        case 'g':
        case 'G':
          handleAutoLayout('grid');
          break;
        case 'm':
        case 'M':
          handleAutoLayout('minimize');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset, selectedEntityId, selectedRelationshipId, deleteEntity, deleteRelationship, selectEntity, selectRelationship, model, handleAutoLayout]);

  // Entity edit handlers
  const handleEntityEdit = useCallback((entity: Entity) => {
    setEditingEntity(entity);
  }, []);

  const handleEntitySave = useCallback((updates: Partial<Entity>) => {
    if (editingEntity) {
      updateEntity(editingEntity.id, updates);
    }
  }, [editingEntity, updateEntity]);

  const handleEntityDelete = useCallback(() => {
    if (editingEntity) {
      deleteEntity(editingEntity.id);
      selectEntity(null);
    }
  }, [editingEntity, deleteEntity, selectEntity]);

  // Relationship edit handlers
  const handleRelationshipEdit = useCallback((relationship: Relationship) => {
    setEditingRelationship(relationship);
  }, []);

  const handleRelationshipSave = useCallback((updates: Partial<Relationship>) => {
    if (editingRelationship) {
      updateRelationship(editingRelationship.id, updates);
    }
  }, [editingRelationship, updateRelationship]);

  const handleRelationshipDelete = useCallback(() => {
    if (editingRelationship) {
      deleteRelationship(editingRelationship.id);
      selectRelationship(null);
    }
  }, [editingRelationship, deleteRelationship, selectRelationship]);

  // Delete selected item handler
  const handleDeleteSelected = useCallback(() => {
    if (selectedEntityId) {
      deleteEntity(selectedEntityId);
      selectEntity(null);
    } else if (selectedRelationshipId) {
      deleteRelationship(selectedRelationshipId);
      selectRelationship(null);
    }
  }, [selectedEntityId, selectedRelationshipId, deleteEntity, deleteRelationship, selectEntity, selectRelationship]);

  // Add new entity handler
  const handleAddEntity = useCallback(() => {
    const newEntity: Entity = {
      id: generateId(),
      name: 'NewEntity',
      physicalName: 'new_entity',
      description: '',
      category: 'standard',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: DEFAULT_ENTITY_WIDTH,
      height: calculateEntityHeight(1),
      attributes: [
        {
          id: generateId(),
          name: 'id',
          type: 'INT',
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
          isUnique: true,
          isIndexed: false,
        },
      ],
    };
    addEntity(newEntity);
    selectEntity(newEntity.id);
    setEditingEntity(newEntity);
  }, [addEntity, selectEntity]);

  if (!model) {
    return (
      <div className="flex-1 flex items-center justify-center bg-light-bg dark:bg-dark-bg text-gray-500">
        <p>No model loaded. Generate one from the home page.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-dark-bg"
    >
      <svg
        ref={svgRef}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : tool === 'pan' ? 'cursor-grab' : 'cursor-default'} touch-none`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Clean background */}
        <rect
          className="canvas-background fill-gray-50 dark:fill-[#0C0C0C]"
          width="100%"
          height="100%"
        />

        {/* Main content group with pan and zoom */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Relationship lines (rendered first, behind entities) */}
          {model.relationships.map((rel) => {
            const sourceEntity = model.entities.find((e) => e.id === rel.sourceEntityId);
            const targetEntity = model.entities.find((e) => e.id === rel.targetEntityId);
            if (!sourceEntity || !targetEntity) return null;

            return (
              <RelationshipLine
                key={rel.id}
                relationship={rel}
                sourceEntity={sourceEntity}
                targetEntity={targetEntity}
                isSelected={selectedRelationshipId === rel.id}
                onSelect={() => selectRelationship(rel.id)}
                onEdit={() => handleRelationshipEdit(rel)}
              />
            );
          })}

          {/* Entity cards */}
          {model.entities.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              isSelected={selectedEntityId === entity.id}
              onSelect={() => selectEntity(entity.id)}
              onDragStart={(e) => handleEntityDragStart(entity.id, e)}
              onTouchStart={(e) => handleEntityTouchStart(entity.id, e)}
              onEdit={() => handleEntityEdit(entity)}
            />
          ))}
        </g>
      </svg>

      {/* Toolbar */}
      <CanvasToolbar
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onFitToScreen={handleFitToScreen}
        tool={tool}
        onToolChange={setTool}
        onAddEntity={handleAddEntity}
        onDelete={handleDeleteSelected}
        hasSelection={!!(selectedEntityId || selectedRelationshipId)}
      />

      {/* Model info */}
      <div className="absolute bottom-4 left-4 bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-sm shadow-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {model.entities.length} entities · {model.relationships.length} relationships
        </span>
      </div>

      {/* Bottom Layout Bar */}
      <CanvasBottomBar
        onLayoutGrid={() => handleAutoLayout('grid')}
        onLayoutSmart={() => handleAutoLayout('smart')}
        onLayoutMinimize={() => handleAutoLayout('minimize')}
        disabled={model.entities.length === 0}
      />

      {/* Entity Edit Modal */}
      {editingEntity && (
        <EntityEditModal
          entity={editingEntity}
          isOpen={!!editingEntity}
          onClose={() => setEditingEntity(null)}
          onSave={handleEntitySave}
          onDelete={handleEntityDelete}
        />
      )}

      {/* Relationship Edit Modal */}
      {editingRelationship && (
        <RelationshipEditModal
          relationship={editingRelationship}
          entities={model.entities}
          isOpen={!!editingRelationship}
          onClose={() => setEditingRelationship(null)}
          onSave={handleRelationshipSave}
          onDelete={handleRelationshipDelete}
        />
      )}
    </div>
  );
}
