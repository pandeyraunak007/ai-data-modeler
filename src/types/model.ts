// Core data model types for AI Data Modeler

export interface Attribute {
  id: string;
  name: string;
  type: string;                           // VARCHAR(255), INT, DECIMAL(10,2), etc.
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  isRequired?: boolean;                   // NOT NULL
  isUnique?: boolean;
  allowNull?: boolean;
  isIndexed?: boolean;
  indexType?: 'unique' | 'non-unique' | 'clustered';
  defaultValue?: string;
  description?: string;
  referencedEntity?: string;              // FK target entity name
  referencedAttribute?: string;           // FK target attribute name
}

export interface Entity {
  id: string;
  name: string;
  physicalName?: string;                  // SQL table name (snake_case)
  x: number;
  y: number;
  width: number;
  height: number;
  attributes: Attribute[];
  category?: 'standard' | 'lookup' | 'view' | 'junction';
  description?: string;
  color?: string;                         // Header color override
}

export interface Relationship {
  id: string;
  name?: string;
  type: 'identifying' | 'non-identifying';
  sourceEntityId: string;
  targetEntityId: string;
  sourceCardinality: Cardinality;
  targetCardinality: Cardinality;
  sourceAttribute?: string;               // FK attribute name
  targetAttribute?: string;               // PK attribute name
}

export type Cardinality = '1' | 'M' | '0..1' | '1..M' | '0..M';

export type DatabaseType = 'postgresql' | 'mysql' | 'sqlserver' | 'oracle' | 'sqlite';

export type NotationType = 'crowsfoot' | 'idef1x' | 'ie';

export interface DataModel {
  id: string;
  name: string;
  description?: string;
  entities: Entity[];
  relationships: Relationship[];
  targetDatabase: DatabaseType;
  notation: NotationType;
  createdAt: string;
  updatedAt: string;
}

// Helper type for model changes
export interface ModelChange {
  type:
    | 'add_entity'
    | 'modify_entity'
    | 'delete_entity'
    | 'add_attribute'
    | 'modify_attribute'
    | 'delete_attribute'
    | 'add_relationship'
    | 'modify_relationship'
    | 'delete_relationship';
  entityId?: string;
  attributeId?: string;
  relationshipId?: string;
  data?: Partial<Entity | Attribute | Relationship>;
}

// Default entity dimensions
export const DEFAULT_ENTITY_WIDTH = 220;
export const DEFAULT_ENTITY_HEIGHT = 150;
export const ATTRIBUTE_ROW_HEIGHT = 24;
export const ENTITY_HEADER_HEIGHT = 32;
export const ENTITY_PADDING = 8;

// Calculate entity height based on attributes
export function calculateEntityHeight(attributeCount: number): number {
  return ENTITY_HEADER_HEIGHT + ENTITY_PADDING * 2 + (attributeCount * ATTRIBUTE_ROW_HEIGHT);
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Create empty model
export function createEmptyModel(name: string = 'Untitled Model'): DataModel {
  return {
    id: generateId(),
    name,
    description: '',
    entities: [],
    relationships: [],
    targetDatabase: 'postgresql',
    notation: 'crowsfoot',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
