/**
 * Image Export Utilities
 * Export diagram canvas as PNG or SVG
 */

import { Entity, Relationship, DataModel } from '@/types/model';

interface ExportOptions {
  backgroundColor?: string;
  padding?: number;
  scale?: number;
  includeBorder?: boolean;
}

/**
 * Calculate the bounding box of all entities
 */
function calculateBoundingBox(entities: Entity[]): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } {
  if (entities.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  entities.forEach((entity) => {
    minX = Math.min(minX, entity.x);
    minY = Math.min(minY, entity.y);
    maxX = Math.max(maxX, entity.x + entity.width);
    maxY = Math.max(maxY, entity.y + entity.height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Generate SVG string from the model
 */
function generateSvgContent(
  model: DataModel,
  options: ExportOptions = {}
): { svgString: string; width: number; height: number } {
  const {
    backgroundColor = '#ffffff',
    padding = 40,
    includeBorder = true,
  } = options;

  const bounds = calculateBoundingBox(model.entities);
  const width = bounds.width + padding * 2;
  const height = bounds.height + padding * 2;
  const offsetX = -bounds.minX + padding;
  const offsetY = -bounds.minY + padding;

  // Start SVG
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  // Add styles
  svg += `
    <defs>
      <style>
        .entity-card { fill: #ffffff; stroke: #e5e7eb; stroke-width: 1; }
        .entity-header { fill: #f9fafb; }
        .entity-header-standard { fill: #eff6ff; }
        .entity-header-lookup { fill: #f0fdf4; }
        .entity-header-junction { fill: #fefce8; }
        .entity-header-view { fill: #faf5ff; }
        .entity-title { font-family: system-ui, -apple-system, sans-serif; font-size: 14px; font-weight: 600; fill: #111827; }
        .attribute-text { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; fill: #374151; }
        .attribute-type { font-family: ui-monospace, monospace; font-size: 11px; fill: #6b7280; }
        .pk-icon { fill: #f59e0b; }
        .fk-icon { fill: #3b82f6; }
        .relationship-line { stroke: #9ca3af; stroke-width: 2; fill: none; }
        .relationship-line-identifying { stroke: #3b82f6; }
        .relationship-line-non-identifying { stroke: #9ca3af; stroke-dasharray: 8, 4; }
      </style>
    </defs>
  `;

  // Background
  svg += `<rect width="${width}" height="${height}" fill="${backgroundColor}" />`;

  if (includeBorder) {
    svg += `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="none" stroke="#e5e7eb" stroke-width="1" />`;
  }

  // Main content group
  svg += `<g transform="translate(${offsetX}, ${offsetY})">`;

  // Render relationships first (behind entities)
  model.relationships.forEach((rel) => {
    const sourceEntity = model.entities.find((e) => e.id === rel.sourceEntityId);
    const targetEntity = model.entities.find((e) => e.id === rel.targetEntityId);
    if (!sourceEntity || !targetEntity) return;

    svg += renderRelationshipSvg(rel, sourceEntity, targetEntity);
  });

  // Render entities
  model.entities.forEach((entity) => {
    svg += renderEntitySvg(entity);
  });

  svg += '</g></svg>';

  return { svgString: svg, width, height };
}

/**
 * Render an entity as SVG
 */
function renderEntitySvg(entity: Entity): string {
  const { x, y, width, height, name, attributes, category } = entity;
  const headerHeight = 36;
  const attributeHeight = 28;
  const cornerRadius = 8;

  // Header color based on category
  const headerClass = `entity-header entity-header-${category || 'standard'}`;

  let svg = `<g transform="translate(${x}, ${y})">`;

  // Card background with shadow effect
  svg += `<rect x="2" y="2" width="${width}" height="${height}" rx="${cornerRadius}" fill="#00000010" />`;
  svg += `<rect class="entity-card" width="${width}" height="${height}" rx="${cornerRadius}" />`;

  // Header
  svg += `<path class="${headerClass}" d="M0,${cornerRadius} Q0,0 ${cornerRadius},0 L${width - cornerRadius},0 Q${width},0 ${width},${cornerRadius} L${width},${headerHeight} L0,${headerHeight} Z" />`;

  // Header divider
  svg += `<line x1="0" y1="${headerHeight}" x2="${width}" y2="${headerHeight}" stroke="#e5e7eb" stroke-width="1" />`;

  // Entity name
  svg += `<text class="entity-title" x="${width / 2}" y="${headerHeight / 2 + 5}" text-anchor="middle">${escapeXml(name)}</text>`;

  // Attributes
  attributes.forEach((attr, index) => {
    const attrY = headerHeight + index * attributeHeight;

    // Attribute row background on hover simulation (zebra striping)
    if (index % 2 === 1) {
      svg += `<rect x="0" y="${attrY}" width="${width}" height="${attributeHeight}" fill="#f9fafb" />`;
    }

    // Icons
    let iconX = 12;
    if (attr.isPrimaryKey) {
      svg += `<text class="pk-icon" x="${iconX}" y="${attrY + 18}" font-size="12">🔑</text>`;
      iconX += 18;
    }
    if (attr.isForeignKey) {
      svg += `<text class="fk-icon" x="${iconX}" y="${attrY + 18}" font-size="12">🔗</text>`;
      iconX += 18;
    }

    // Attribute name
    const textX = attr.isPrimaryKey || attr.isForeignKey ? iconX + 4 : 12;
    svg += `<text class="attribute-text" x="${textX}" y="${attrY + 18}">${escapeXml(attr.name)}</text>`;

    // Attribute type
    svg += `<text class="attribute-type" x="${width - 12}" y="${attrY + 18}" text-anchor="end">${escapeXml(attr.type)}</text>`;
  });

  svg += '</g>';
  return svg;
}

/**
 * Render a relationship line as SVG
 */
function renderRelationshipSvg(rel: Relationship, source: Entity, target: Entity): string {
  // Calculate connection points
  const sourceCenter = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  const targetCenter = { x: target.x + target.width / 2, y: target.y + target.height / 2 };

  // Determine which sides to connect
  const { sourcePoint, targetPoint } = calculateConnectionPoints(source, target);

  // Line class based on type
  const lineClass = rel.type === 'identifying' ? 'relationship-line relationship-line-identifying' : 'relationship-line relationship-line-non-identifying';

  // Create path with a slight curve
  const midX = (sourcePoint.x + targetPoint.x) / 2;
  const midY = (sourcePoint.y + targetPoint.y) / 2;

  let svg = `<path class="${lineClass}" d="M${sourcePoint.x},${sourcePoint.y} Q${midX},${sourcePoint.y} ${midX},${midY} Q${midX},${targetPoint.y} ${targetPoint.x},${targetPoint.y}" />`;

  // Add cardinality markers
  svg += renderCardinalityMarker(sourcePoint, targetPoint, rel.sourceCardinality, 'source');
  svg += renderCardinalityMarker(targetPoint, sourcePoint, rel.targetCardinality, 'target');

  return svg;
}

/**
 * Calculate connection points between two entities
 */
function calculateConnectionPoints(source: Entity, target: Entity): { sourcePoint: { x: number; y: number }; targetPoint: { x: number; y: number } } {
  const sourceCenter = { x: source.x + source.width / 2, y: source.y + source.height / 2 };
  const targetCenter = { x: target.x + target.width / 2, y: target.y + target.height / 2 };

  const dx = targetCenter.x - sourceCenter.x;
  const dy = targetCenter.y - sourceCenter.y;

  let sourcePoint, targetPoint;

  // Determine connection sides based on relative positions
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    if (dx > 0) {
      sourcePoint = { x: source.x + source.width, y: sourceCenter.y };
      targetPoint = { x: target.x, y: targetCenter.y };
    } else {
      sourcePoint = { x: source.x, y: sourceCenter.y };
      targetPoint = { x: target.x + target.width, y: targetCenter.y };
    }
  } else {
    // Vertical connection
    if (dy > 0) {
      sourcePoint = { x: sourceCenter.x, y: source.y + source.height };
      targetPoint = { x: targetCenter.x, y: target.y };
    } else {
      sourcePoint = { x: sourceCenter.x, y: source.y };
      targetPoint = { x: targetCenter.x, y: target.y + target.height };
    }
  }

  return { sourcePoint, targetPoint };
}

/**
 * Render cardinality marker (crow's foot notation)
 */
function renderCardinalityMarker(
  point: { x: number; y: number },
  otherPoint: { x: number; y: number },
  cardinality: string,
  _side: 'source' | 'target'
): string {
  const dx = otherPoint.x - point.x;
  const dy = otherPoint.y - point.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return '';

  const nx = dx / length;
  const ny = dy / length;

  const markerSize = 12;
  const offset = 8;

  // Position for the marker
  const mx = point.x + nx * offset;
  const my = point.y + ny * offset;

  let svg = '';

  // Perpendicular direction
  const px = -ny;
  const py = nx;

  if (cardinality === 'M' || cardinality === 'N') {
    // Crow's foot (three lines)
    svg += `<line x1="${point.x}" y1="${point.y}" x2="${mx + px * markerSize}" y2="${my + py * markerSize}" stroke="#9ca3af" stroke-width="2" />`;
    svg += `<line x1="${point.x}" y1="${point.y}" x2="${mx}" y2="${my}" stroke="#9ca3af" stroke-width="2" />`;
    svg += `<line x1="${point.x}" y1="${point.y}" x2="${mx - px * markerSize}" y2="${my - py * markerSize}" stroke="#9ca3af" stroke-width="2" />`;
  } else if (cardinality === '1') {
    // Single line (one)
    svg += `<line x1="${mx + px * markerSize / 2}" y1="${my + py * markerSize / 2}" x2="${mx - px * markerSize / 2}" y2="${my - py * markerSize / 2}" stroke="#9ca3af" stroke-width="2" />`;
  }

  return svg;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Export diagram as SVG file
 */
export function exportAsSvg(model: DataModel, filename?: string): void {
  const { svgString } = generateSvgContent(model, { backgroundColor: '#ffffff' });

  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${model.name.toLowerCase().replace(/\s+/g, '-')}-diagram.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export diagram as PNG file
 */
export function exportAsPng(model: DataModel, filename?: string, scale: number = 2): Promise<void> {
  return new Promise((resolve, reject) => {
    const { svgString, width, height } = generateSvgContent(model, { backgroundColor: '#ffffff' });

    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not create PNG blob'));
          return;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || `${model.name.toLowerCase().replace(/\s+/g, '-')}-diagram.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        resolve();
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };

    img.src = url;
  });
}

/**
 * Copy diagram as PNG to clipboard
 */
export async function copyAsPng(model: DataModel, scale: number = 2): Promise<void> {
  const { svgString, width, height } = generateSvgContent(model, { backgroundColor: '#ffffff' });

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = async () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      try {
        const blob = await new Promise<Blob>((res, rej) => {
          canvas.toBlob((b) => {
            if (b) res(b);
            else rej(new Error('Could not create blob'));
          }, 'image/png');
        });

        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };

    img.src = url;
  });
}
