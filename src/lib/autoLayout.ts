// Auto-layout algorithm for positioning entities on canvas

import { Entity, DEFAULT_ENTITY_WIDTH, calculateEntityHeight } from '@/types/model';

const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 60;
const CANVAS_PADDING = 50;
const ENTITIES_PER_ROW = 3;

export interface LayoutOptions {
  startX?: number;
  startY?: number;
  maxWidth?: number;
  entitiesPerRow?: number;
}

/**
 * Auto-layout entities in a grid pattern
 */
export function autoLayoutEntities(
  entities: Entity[],
  options: LayoutOptions = {}
): Entity[] {
  const {
    startX = CANVAS_PADDING,
    startY = CANVAS_PADDING,
    entitiesPerRow = ENTITIES_PER_ROW,
  } = options;

  let currentX = startX;
  let currentY = startY;
  let maxHeightInRow = 0;
  let currentColumn = 0;

  return entities.map((entity, index) => {
    // Calculate entity dimensions
    const width = entity.width || DEFAULT_ENTITY_WIDTH;
    const height = calculateEntityHeight(entity.attributes.length);

    // Position entity
    const positionedEntity: Entity = {
      ...entity,
      x: currentX,
      y: currentY,
      width,
      height,
    };

    // Track max height in current row
    maxHeightInRow = Math.max(maxHeightInRow, height);

    // Move to next position
    currentColumn++;
    if (currentColumn >= entitiesPerRow) {
      // Move to next row
      currentColumn = 0;
      currentX = startX;
      currentY += maxHeightInRow + VERTICAL_GAP;
      maxHeightInRow = 0;
    } else {
      // Move to next column
      currentX += width + HORIZONTAL_GAP;
    }

    return positionedEntity;
  });
}

/**
 * Layout entities by grouping related ones closer together
 * Based on relationships - entities with direct relationships are placed nearby
 */
export function smartLayout(
  entities: Entity[],
  relationships: { sourceEntityId: string; targetEntityId: string }[]
): Entity[] {
  if (entities.length === 0) return [];

  // Build adjacency map
  const adjacency = new Map<string, Set<string>>();
  entities.forEach(e => adjacency.set(e.id, new Set()));

  relationships.forEach(r => {
    adjacency.get(r.sourceEntityId)?.add(r.targetEntityId);
    adjacency.get(r.targetEntityId)?.add(r.sourceEntityId);
  });

  // Find central entity (most relationships)
  let centralEntity = entities[0];
  let maxConnections = 0;
  entities.forEach(e => {
    const connections = adjacency.get(e.id)?.size || 0;
    if (connections > maxConnections) {
      maxConnections = connections;
      centralEntity = e;
    }
  });

  // Position entities using BFS from central entity
  const positioned = new Map<string, { x: number; y: number }>();
  const visited = new Set<string>();
  const queue: { id: string; level: number; position: number }[] = [];

  // Start with central entity at center
  const centerX = 400;
  const centerY = 300;
  positioned.set(centralEntity.id, { x: centerX, y: centerY });
  visited.add(centralEntity.id);

  // Add connected entities to queue
  const connectedEntities = Array.from(adjacency.get(centralEntity.id) || []);
  connectedEntities.forEach((connectedId, idx) => {
    queue.push({ id: connectedId, level: 1, position: idx });
  });

  // Process queue
  while (queue.length > 0) {
    const { id, level, position } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    // Calculate position in a circular pattern around center
    const angle = (position * 2 * Math.PI) / Math.max(adjacency.get(centralEntity.id)?.size || 1, 1);
    const radius = level * (DEFAULT_ENTITY_WIDTH + HORIZONTAL_GAP);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    positioned.set(id, { x: Math.max(CANVAS_PADDING, x), y: Math.max(CANVAS_PADDING, y) });

    // Add unvisited neighbors
    const neighbors = Array.from(adjacency.get(id) || []);
    neighbors.forEach((neighborId, idx) => {
      if (!visited.has(neighborId)) {
        queue.push({ id: neighborId, level: level + 1, position: idx });
      }
    });
  }

  // Position any remaining unconnected entities
  let orphanX = CANVAS_PADDING;
  let orphanY = centerY + 400;
  entities.forEach(e => {
    if (!positioned.has(e.id)) {
      positioned.set(e.id, { x: orphanX, y: orphanY });
      orphanX += DEFAULT_ENTITY_WIDTH + HORIZONTAL_GAP;
      if (orphanX > 1200) {
        orphanX = CANVAS_PADDING;
        orphanY += 200;
      }
    }
  });

  // Apply positions to entities
  return entities.map(entity => {
    const pos = positioned.get(entity.id) || { x: CANVAS_PADDING, y: CANVAS_PADDING };
    const height = calculateEntityHeight(entity.attributes.length);
    return {
      ...entity,
      x: pos.x,
      y: pos.y,
      width: entity.width || DEFAULT_ENTITY_WIDTH,
      height,
    };
  });
}

/**
 * Arrange entities to minimize relationship line crossings (simplified version)
 */
export function minimizeCrossings(
  entities: Entity[],
  relationships: { sourceEntityId: string; targetEntityId: string }[]
): Entity[] {
  // For now, use smart layout which considers relationships
  return smartLayout(entities, relationships);
}
