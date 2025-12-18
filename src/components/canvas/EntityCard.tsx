'use client';

import React from 'react';
import { Entity, Attribute, ENTITY_HEADER_HEIGHT, ATTRIBUTE_ROW_HEIGHT, ENTITY_PADDING } from '@/types/model';
import { Key, Link, Hash, CircleDot } from 'lucide-react';

interface EntityCardProps {
  entity: Entity;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export default function EntityCard({
  entity,
  isSelected,
  onSelect,
  onDragStart,
}: EntityCardProps) {
  // Get header color based on category
  const getHeaderColor = () => {
    switch (entity.category) {
      case 'lookup':
        return 'bg-entity-lookup';
      case 'junction':
        return 'bg-entity-junction';
      case 'view':
        return 'bg-entity-view';
      default:
        return 'bg-entity-standard';
    }
  };

  // Separate primary keys and other attributes
  const pkAttributes = entity.attributes.filter(a => a.isPrimaryKey);
  const otherAttributes = entity.attributes.filter(a => !a.isPrimaryKey);

  const renderAttribute = (attr: Attribute, index: number) => (
    <div
      key={attr.id}
      className={`attribute-row ${attr.isPrimaryKey ? 'pk' : ''} ${attr.isForeignKey ? 'fk' : ''}`}
      style={{ height: ATTRIBUTE_ROW_HEIGHT }}
    >
      {/* Icons */}
      <div className="w-5 flex justify-center">
        {attr.isPrimaryKey && <Key className="w-3 h-3 text-yellow-500" />}
        {attr.isForeignKey && !attr.isPrimaryKey && <Link className="w-3 h-3 text-accent-info" />}
        {attr.isIndexed && !attr.isPrimaryKey && !attr.isForeignKey && (
          <Hash className="w-3 h-3 text-gray-500" />
        )}
      </div>

      {/* Attribute name */}
      <span className={`flex-1 truncate ${attr.isPrimaryKey ? 'font-semibold' : ''}`}>
        {attr.name}
      </span>

      {/* Required indicator */}
      {attr.isRequired && !attr.isPrimaryKey && (
        <CircleDot className="w-2.5 h-2.5 text-accent-danger mr-1" />
      )}

      {/* Data type */}
      <span className="text-gray-500 text-xs ml-2">{attr.type}</span>
    </div>
  );

  return (
    <g
      transform={`translate(${entity.x}, ${entity.y})`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={onDragStart}
      style={{ cursor: 'move' }}
    >
      {/* Card background */}
      <foreignObject
        width={entity.width}
        height={entity.height}
        style={{ overflow: 'visible' }}
      >
        <div
          className={`entity-card h-full ${isSelected ? 'selected' : ''}`}
          style={{ width: entity.width }}
        >
          {/* Header */}
          <div
            className={`${getHeaderColor()} px-3 py-2 rounded-t-lg flex items-center justify-between`}
            style={{ height: ENTITY_HEADER_HEIGHT }}
          >
            <span className="font-semibold text-white truncate">{entity.name}</span>
            {entity.category && entity.category !== 'standard' && (
              <span className="text-xs text-white/70 uppercase">{entity.category}</span>
            )}
          </div>

          {/* Attributes container */}
          <div className="px-1 py-1" style={{ paddingTop: ENTITY_PADDING, paddingBottom: ENTITY_PADDING }}>
            {/* Primary Key section */}
            {pkAttributes.length > 0 && (
              <>
                {pkAttributes.map(renderAttribute)}
                {otherAttributes.length > 0 && (
                  <div className="border-b border-dashed border-dark-border my-1" />
                )}
              </>
            )}

            {/* Other attributes */}
            {otherAttributes.map(renderAttribute)}

            {/* Empty state */}
            {entity.attributes.length === 0 && (
              <div className="text-gray-500 text-sm px-2 py-2 italic">
                No attributes
              </div>
            )}
          </div>
        </div>
      </foreignObject>

      {/* Connection points (shown when selected) */}
      {isSelected && (
        <>
          {/* Top */}
          <circle
            cx={entity.width / 2}
            cy={0}
            r={6}
            className="fill-accent-primary stroke-white stroke-2"
          />
          {/* Right */}
          <circle
            cx={entity.width}
            cy={entity.height / 2}
            r={6}
            className="fill-accent-primary stroke-white stroke-2"
          />
          {/* Bottom */}
          <circle
            cx={entity.width / 2}
            cy={entity.height}
            r={6}
            className="fill-accent-primary stroke-white stroke-2"
          />
          {/* Left */}
          <circle
            cx={0}
            cy={entity.height / 2}
            r={6}
            className="fill-accent-primary stroke-white stroke-2"
          />
        </>
      )}
    </g>
  );
}
