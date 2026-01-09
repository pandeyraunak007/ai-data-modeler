// Proposal types for AI Data Modeler
// Implements "Understand → Propose → Confirm → Execute" workflow

import { Entity, Attribute, Relationship, ModelChange, Cardinality } from './model';
import { ChangePreviewResponse, ImpactSummaryResponse, RawChangeResponse } from '@/lib/prompts/modifyModel';

// Re-export for convenience
export type { ChangePreviewResponse, ImpactSummaryResponse, RawChangeResponse };

// ============================================================
// Model Generation Proposals (for new model creation)
// ============================================================

export interface EntityPreview {
  id: string;
  name: string;
  description: string;
  category: 'standard' | 'lookup' | 'junction' | 'view';
  estimatedAttributeCount: number;
  isSelected: boolean;
}

export interface RelationshipPreview {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: 'identifying' | 'non-identifying';
  sourceCardinality: Cardinality;
  targetCardinality: Cardinality;
  description: string;
}

export interface ModelVariant {
  id: string;
  name: string;
  description: string;
  complexity: 'minimal' | 'standard' | 'comprehensive';
  entities: EntityPreview[];
  relationships: RelationshipPreview[];
  estimatedTables: number;
  useCases: string[];
}

export interface GenerationProposal {
  type: 'generation';
  id: string;
  originalPrompt: string;
  variants: ModelVariant[];
  selectedVariantId: string | null;
  selectedEntityIds: string[];
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

// ============================================================
// Modification Proposals (for chat-based changes)
// ============================================================

// Re-export ChangeType from modifyModel
export type { ChangeType } from '@/lib/prompts/modifyModel';
import { ChangeType } from '@/lib/prompts/modifyModel';

// ChangePreview is an alias for ChangePreviewResponse for backwards compatibility
export type ChangePreview = ChangePreviewResponse;

// ImpactSummary is an alias for ImpactSummaryResponse
export type ImpactSummary = ImpactSummaryResponse;

export interface ModificationProposal {
  type: 'modification';
  id: string;
  originalMessage: string;
  explanation: string;
  changes: ChangePreviewResponse[];
  impactSummary: ImpactSummaryResponse;
  warnings: string[];
  suggestions: string[];
  rawChanges: RawChangeResponse[];
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export type Proposal = GenerationProposal | ModificationProposal;

// ============================================================
// API Response Types
// ============================================================

export interface GenerateProposalResponse {
  success: boolean;
  proposal?: {
    variants: ModelVariant[];
  };
  error?: string;
}

export interface ModifyProposalResponse {
  type: 'modification';
  explanation: string;
  changes: ChangePreviewResponse[];
  impactSummary: ImpactSummaryResponse;
  warnings: string[];
  suggestions: string[];
  rawChanges: RawChangeResponse[];
}

export interface ConfirmGenerationRequest {
  originalPrompt: string;
  selectedVariantId: string;
  selectedEntityIds: string[];
  targetDatabase: string;
  notation?: string;
}

// ============================================================
// Helper functions
// ============================================================

export function createGenerationProposal(
  prompt: string,
  variants: ModelVariant[]
): GenerationProposal {
  return {
    type: 'generation',
    id: Math.random().toString(36).substring(2, 15),
    originalPrompt: prompt,
    variants,
    selectedVariantId: variants.length > 0 ? variants[0].id : null,
    selectedEntityIds: variants.length > 0 ? variants[0].entities.map(e => e.id) : [],
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

export function createModificationProposal(
  message: string,
  response: ModifyProposalResponse
): ModificationProposal {
  return {
    type: 'modification',
    id: Math.random().toString(36).substring(2, 15),
    originalMessage: message,
    explanation: response.explanation,
    changes: response.changes,
    impactSummary: response.impactSummary,
    warnings: response.warnings,
    suggestions: response.suggestions,
    rawChanges: response.rawChanges,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

export function getImpactColor(impact: 'low' | 'medium' | 'high'): string {
  switch (impact) {
    case 'low':
      return 'text-green-600 dark:text-green-400';
    case 'medium':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'high':
      return 'text-red-600 dark:text-red-400';
  }
}

export function getChangeIcon(type: ChangeType): string {
  if (type.startsWith('add_')) return '+';
  if (type.startsWith('modify_')) return '~';
  if (type.startsWith('delete_')) return '-';
  return '•';
}

export function getChangeColor(type: ChangeType): string {
  if (type.startsWith('add_')) return 'text-green-600 dark:text-green-400';
  if (type.startsWith('modify_')) return 'text-yellow-600 dark:text-yellow-400';
  if (type.startsWith('delete_')) return 'text-red-600 dark:text-red-400';
  return 'text-gray-600 dark:text-gray-400';
}
