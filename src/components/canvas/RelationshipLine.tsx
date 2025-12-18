'use client';

import React from 'react';
import { Entity, Relationship, Cardinality } from '@/types/model';

interface RelationshipLineProps {
  relationship: Relationship;
  sourceEntity: Entity;
  targetEntity: Entity;
  isSelected: boolean;
  onSelect: () => void;
}

// Calculate the best connection points between two entities
function calculateConnectionPoints(source: Entity, target: Entity) {
  const sourceCenter = {
    x: source.x + source.width / 2,
    y: source.y + source.height / 2,
  };
  const targetCenter = {
    x: target.x + target.width / 2,
    y: target.y + target.height / 2,
  };

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  let sourcePoint: { x: number; y: number };
  let targetPoint: { x: number; y: number };

  // Determine which sides to connect based on relative positions
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    if (dx > 0) {
      // Target is to the right
      sourcePoint = { x: source.x + source.width, y: source.y + source.height / 2 };
      targetPoint = { x: target.x, y: target.y + target.height / 2 };
    } else {
      // Target is to the left
      sourcePoint = { x: source.x, y: source.y + source.height / 2 };
      targetPoint = { x: target.x + target.width, y: target.y + target.height / 2 };
    }
  } else {
    // Vertical connection
    if (dy > 0) {
      // Target is below
      sourcePoint = { x: source.x + source.width / 2, y: source.y + source.height };
      targetPoint = { x: target.x + target.width / 2, y: target.y };
    } else {
      // Target is above
      sourcePoint = { x: source.x + source.width / 2, y: source.y };
      targetPoint = { x: target.x + target.width / 2, y: target.y + target.height };
    }
  }

  return { sourcePoint, targetPoint };
}

// Draw crow's foot cardinality notation
function CrowsFootMarker({
  x,
  y,
  angle,
  cardinality,
  isSource,
}: {
  x: number;
  y: number;
  angle: number;
  cardinality: Cardinality;
  isSource: boolean;
}) {
  const size = 15;
  const transform = `translate(${x}, ${y}) rotate(${angle})`;

  const renderCardinality = () => {
    switch (cardinality) {
      case '1':
        // One - single vertical line
        return (
          <g transform={transform}>
            <line x1={-size} y1={-6} x2={-size} y2={6} className="stroke-current stroke-2" />
          </g>
        );

      case 'M':
      case '0..M':
      case '1..M':
        // Many - crow's foot
        return (
          <g transform={transform}>
            <line x1={0} y1={0} x2={-size} y2={-8} className="stroke-current stroke-2" />
            <line x1={0} y1={0} x2={-size} y2={0} className="stroke-current stroke-2" />
            <line x1={0} y1={0} x2={-size} y2={8} className="stroke-current stroke-2" />
            {(cardinality === '0..M') && (
              <circle cx={-size - 6} cy={0} r={4} className="stroke-current stroke-2 fill-dark-bg" />
            )}
            {(cardinality === '1..M') && (
              <line x1={-size - 8} y1={-6} x2={-size - 8} y2={6} className="stroke-current stroke-2" />
            )}
          </g>
        );

      case '0..1':
        // Zero or one - line with circle
        return (
          <g transform={transform}>
            <line x1={-size} y1={-6} x2={-size} y2={6} className="stroke-current stroke-2" />
            <circle cx={-size - 8} cy={0} r={4} className="stroke-current stroke-2 fill-dark-bg" />
          </g>
        );

      default:
        return null;
    }
  };

  return renderCardinality();
}

export default function RelationshipLine({
  relationship,
  sourceEntity,
  targetEntity,
  isSelected,
  onSelect,
}: RelationshipLineProps) {
  const { sourcePoint, targetPoint } = calculateConnectionPoints(sourceEntity, targetEntity);

  // Calculate angle for cardinality markers
  const dx = targetPoint.x - sourcePoint.x;
  const dy = targetPoint.y - sourcePoint.y;
  const sourceAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const targetAngle = sourceAngle + 180;

  // Calculate midpoint for relationship label
  const midX = (sourcePoint.x + targetPoint.x) / 2;
  const midY = (sourcePoint.y + targetPoint.y) / 2;

  const lineClass = relationship.type === 'identifying'
    ? 'relationship-line identifying'
    : 'relationship-line non-identifying';

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{ cursor: 'pointer' }}
      className={isSelected ? 'text-accent-primary' : 'text-gray-500'}
    >
      {/* Invisible wider line for easier clicking */}
      <line
        x1={sourcePoint.x}
        y1={sourcePoint.y}
        x2={targetPoint.x}
        y2={targetPoint.y}
        stroke="transparent"
        strokeWidth={20}
      />

      {/* Visible relationship line */}
      <line
        x1={sourcePoint.x}
        y1={sourcePoint.y}
        x2={targetPoint.x}
        y2={targetPoint.y}
        className={`${lineClass} ${isSelected ? 'stroke-accent-primary stroke-[3]' : ''}`}
      />

      {/* Source cardinality marker */}
      <CrowsFootMarker
        x={sourcePoint.x + (dx * 0.1)}
        y={sourcePoint.y + (dy * 0.1)}
        angle={sourceAngle}
        cardinality={relationship.sourceCardinality}
        isSource={true}
      />

      {/* Target cardinality marker */}
      <CrowsFootMarker
        x={targetPoint.x - (dx * 0.1)}
        y={targetPoint.y - (dy * 0.1)}
        angle={targetAngle}
        cardinality={relationship.targetCardinality}
        isSource={false}
      />

      {/* Relationship name label */}
      {relationship.name && (
        <g transform={`translate(${midX}, ${midY})`}>
          <rect
            x={-relationship.name.length * 4 - 4}
            y={-10}
            width={relationship.name.length * 8 + 8}
            height={20}
            rx={4}
            className="fill-dark-bg stroke-dark-border"
          />
          <text
            textAnchor="middle"
            dy={5}
            className="fill-gray-400 text-xs"
          >
            {relationship.name}
          </text>
        </g>
      )}
    </g>
  );
}
