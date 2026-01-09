// Chat modification prompts for AI Data Modeler
// Updated to support "Understand → Propose → Confirm → Execute" workflow

import { DataModel } from '@/types/model';

export const SYSTEM_PROMPT_MODIFY = `You are a data modeling assistant. Analyze the user's request and PROPOSE changes.
DO NOT apply changes directly. Instead, explain what you intend to do and provide detailed impact analysis.

## Current Model
{MODEL_JSON}

## Output Format (JSON)
{
  "explanation": "Clear, human-readable explanation of what changes will be made and why",
  "changes": [
    {
      "type": "add_entity|modify_entity|delete_entity|add_attribute|modify_attribute|delete_attribute|add_relationship|modify_relationship|delete_relationship",
      "entityId": "target entity id",
      "entityName": "Entity Name (for display)",
      "attributeId": "target attribute id",
      "attributeName": "Attribute Name (for display)",
      "relationshipId": "target relationship id",
      "relationshipName": "Relationship description (for display)",
      "description": "Human-readable description of this specific change",
      "impact": "low|medium|high",
      "details": {
        "before": { /* current state for modifications */ },
        "after": { /* proposed new state */ }
      }
    }
  ],
  "impactSummary": {
    "entitiesAffected": 2,
    "attributesAffected": 5,
    "relationshipsAffected": 1,
    "breakingChanges": ["Description of any breaking change"]
  },
  "warnings": ["Potential issues or considerations"],
  "suggestions": ["Follow-up suggestions for the user"],
  "rawChanges": [
    {
      "type": "add_entity|modify_entity|delete_entity|add_attribute|modify_attribute|delete_attribute|add_relationship|modify_relationship|delete_relationship",
      "entityId": "target entity id",
      "attributeId": "target attribute id",
      "relationshipId": "target relationship id",
      "data": {
        // For add_entity: full entity object (without x, y, width, height)
        // For modify_entity: partial entity updates
        // For add_attribute: full attribute object
        // For modify_attribute: partial attribute updates
        // For add_relationship: full relationship object
        // For modify_relationship: partial relationship updates
        // For delete operations: null or omit
      }
    }
  ]
}

## Impact Levels
- "low": Adding new items, renaming, adding optional fields
- "medium": Modifying data types, adding required fields, changing cardinality
- "high": Deleting entities/relationships, removing columns, breaking FK constraints

## Guidelines
1. Preserve existing IDs when modifying entities, attributes, or relationships
2. When adding new items, generate unique IDs using alphanumeric strings
3. Provide clear, user-friendly descriptions for each change
4. Calculate impact accurately based on the operation type
5. Warn about cascading effects (e.g., deleting entity removes relationships)
6. Include both display-friendly 'changes' and execution 'rawChanges'
7. Be specific about what will change - mention entity/attribute names
8. For delete operations, list affected relationships in breakingChanges

## Examples of User Commands
- "Add a status field to the users table"
- "Create a new entity for user preferences"
- "Add a relationship between orders and products"
- "Remove the phone column from customers"
- "Rename the 'date' column to 'created_at'"
- "Make email required and unique"
- "Add audit fields to all entities"
- "Normalize this model"
- "Delete unused entities"`;

export function createModifyPrompt(currentModel: DataModel, userMessage: string) {
  const systemPrompt = SYSTEM_PROMPT_MODIFY.replace(
    '{MODEL_JSON}',
    JSON.stringify(currentModel, null, 2)
  );

  return {
    messages: [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userMessage },
    ],
  };
}

// Change type union
export type ChangeType =
  | 'add_entity'
  | 'modify_entity'
  | 'delete_entity'
  | 'add_attribute'
  | 'modify_attribute'
  | 'delete_attribute'
  | 'add_relationship'
  | 'modify_relationship'
  | 'delete_relationship';

// Updated response interface with proposal structure
export interface ChangePreviewResponse {
  type: ChangeType;
  entityId?: string;
  entityName?: string;
  attributeId?: string;
  attributeName?: string;
  relationshipId?: string;
  relationshipName?: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  details: {
    before?: any;
    after?: any;
  };
}

export interface ImpactSummaryResponse {
  entitiesAffected: number;
  attributesAffected: number;
  relationshipsAffected: number;
  breakingChanges: string[];
}

export interface RawChangeResponse {
  type: ChangeType;
  entityId?: string;
  attributeId?: string;
  relationshipId?: string;
  data?: any;
}

export interface ModelChangeResponse {
  explanation: string;
  changes: ChangePreviewResponse[];
  impactSummary: ImpactSummaryResponse;
  warnings: string[];
  suggestions: string[];
  rawChanges: RawChangeResponse[];
}

// Legacy interface for backwards compatibility
export interface LegacyModelChangeResponse {
  changes: Array<{
    type: string;
    entityId?: string;
    attributeId?: string;
    relationshipId?: string;
    data?: any;
  }>;
  explanation: string;
  warnings: string[];
  suggestions: string[];
}

export function parseModifyResponse(response: string): ModelChangeResponse | null {
  try {
    const parsed = JSON.parse(response);

    // Check if it's the new proposal format
    if (parsed.impactSummary && parsed.rawChanges) {
      return {
        explanation: parsed.explanation || '',
        changes: parsed.changes || [],
        impactSummary: parsed.impactSummary || {
          entitiesAffected: 0,
          attributesAffected: 0,
          relationshipsAffected: 0,
          breakingChanges: [],
        },
        warnings: parsed.warnings || [],
        suggestions: parsed.suggestions || [],
        rawChanges: parsed.rawChanges || [],
      };
    }

    // Legacy format conversion - convert old format to new format
    if (parsed.changes && !parsed.rawChanges) {
      const changes = parsed.changes || [];
      return {
        explanation: parsed.explanation || '',
        changes: changes.map((c: any) => ({
          type: c.type,
          entityId: c.entityId,
          entityName: c.entityName || c.data?.name,
          attributeId: c.attributeId,
          attributeName: c.attributeName || c.data?.name,
          relationshipId: c.relationshipId,
          description: `${c.type.replace(/_/g, ' ')}`,
          impact: 'medium' as const,
          details: {
            before: null,
            after: c.data,
          },
        })),
        impactSummary: {
          entitiesAffected: changes.filter((c: any) => c.type.includes('entity')).length,
          attributesAffected: changes.filter((c: any) => c.type.includes('attribute')).length,
          relationshipsAffected: changes.filter((c: any) => c.type.includes('relationship')).length,
          breakingChanges: [],
        },
        warnings: parsed.warnings || [],
        suggestions: parsed.suggestions || [],
        rawChanges: changes,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// Helper to get raw changes for execution
export function extractRawChanges(response: ModelChangeResponse): RawChangeResponse[] {
  return response.rawChanges;
}
