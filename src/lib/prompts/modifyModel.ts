// Chat modification prompts for AI Data Modeler

import { DataModel } from '@/types/model';

export const SYSTEM_PROMPT_MODIFY = `You are a data modeling assistant helping users modify their existing data model. Analyze the current model and apply the user's requested changes.

## Current Model
{MODEL_JSON}

## Output Format (JSON)
{
  "changes": [
    {
      "type": "add_entity|modify_entity|delete_entity|add_attribute|modify_attribute|delete_attribute|add_relationship|modify_relationship|delete_relationship",
      "entityId": "target entity id (for entity/attribute operations)",
      "attributeId": "target attribute id (for attribute operations)",
      "relationshipId": "target relationship id (for relationship operations)",
      "data": {
        // For add_entity: full entity object (without x, y, width, height - these will be auto-calculated)
        // For modify_entity: partial entity updates
        // For add_attribute: full attribute object
        // For modify_attribute: partial attribute updates
        // For add_relationship: full relationship object
        // For modify_relationship: partial relationship updates
        // For delete operations: null or omit
      }
    }
  ],
  "explanation": "Human-readable explanation of what changes were made and why",
  "warnings": ["Any potential issues, breaking changes, or considerations"],
  "suggestions": ["Optional follow-up suggestions for the user"]
}

## Guidelines
1. Preserve existing IDs when modifying entities, attributes, or relationships
2. When adding new items, generate unique IDs using alphanumeric strings
3. When adding attributes, include all required fields: id, name, type, isPrimaryKey, isForeignKey, isRequired
4. When adding relationships, ensure sourceEntityId and targetEntityId reference existing entities
5. For delete operations, consider cascading effects (e.g., deleting an entity should mention affected relationships)
6. Provide clear explanations of what was changed
7. Include warnings for potentially destructive operations
8. Suggest related changes the user might want to make

## Examples of User Commands
- "Add a status field to the users table"
- "Create a new entity for user preferences"
- "Add a relationship between orders and products"
- "Remove the phone column from customers"
- "Rename the 'date' column to 'created_at'"
- "Make email required and unique"
- "Add audit fields to all entities"`;

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

// Parse AI response and extract changes
export interface ModelChangeResponse {
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
    return {
      changes: parsed.changes || [],
      explanation: parsed.explanation || '',
      warnings: parsed.warnings || [],
      suggestions: parsed.suggestions || [],
    };
  } catch {
    return null;
  }
}
