'use client';

import { useModel } from '@/context/ModelContext';
import { Relationship, Cardinality } from '@/types/model';
import { InlineEdit, InlineSelect } from './InlineEdit';
import { ArrowRight, Table2 } from 'lucide-react';

const RELATIONSHIP_TYPE_OPTIONS = [
  { value: 'identifying', label: 'Identifying (solid line)' },
  { value: 'non-identifying', label: 'Non-Identifying (dashed line)' },
];

const CARDINALITY_OPTIONS = [
  { value: '1', label: 'One (1)' },
  { value: '0..1', label: 'Zero or One (0..1)' },
  { value: 'M', label: 'Many (M)' },
  { value: '0..M', label: 'Zero or Many (0..M)' },
  { value: '1..M', label: 'One or Many (1..M)' },
];

interface RelationshipPropertiesProps {
  relationship: Relationship;
}

export default function RelationshipProperties({ relationship }: RelationshipPropertiesProps) {
  const { model, updateRelationship, selectEntity, selectRelationship } = useModel();

  const sourceEntity = model?.entities.find(e => e.id === relationship.sourceEntityId);
  const targetEntity = model?.entities.find(e => e.id === relationship.targetEntityId);

  const handleUpdate = (updates: Partial<Relationship>) => {
    updateRelationship(relationship.id, updates);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Relationship Info */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Relationship Details
        </h3>

        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Name (Optional)</label>
            <InlineEdit
              value={relationship.name || ''}
              onSave={(value) => handleUpdate({ name: value || undefined })}
              placeholder="e.g., has_many, belongs_to"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Type</label>
            <InlineSelect
              value={relationship.type}
              options={RELATIONSHIP_TYPE_OPTIONS}
              onSave={(value) => handleUpdate({ type: value as Relationship['type'] })}
            />
          </div>
        </div>
      </div>

      {/* Visual Representation */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Connection
        </h3>

        <div className="p-4 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between gap-2">
            {/* Source Entity */}
            <button
              onClick={() => {
                selectRelationship(null);
                selectEntity(relationship.sourceEntityId);
              }}
              className="flex-1 p-2 rounded-lg border border-light-border dark:border-dark-border hover:border-accent-primary hover:bg-accent-primary/5 transition-colors text-center"
            >
              <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                <Table2 className="w-3 h-3" />
                <span className="text-xs">Source</span>
              </div>
              <p className="font-medium text-sm truncate">{sourceEntity?.name || 'Unknown'}</p>
              <p className="text-xs text-accent-primary mt-1">{relationship.sourceCardinality}</p>
            </button>

            {/* Arrow */}
            <div className="flex flex-col items-center px-2">
              <div className={`w-8 h-0.5 ${relationship.type === 'identifying' ? 'bg-accent-primary' : 'bg-gray-400 border-dashed border-t-2 border-gray-400 h-0'}`} />
              <ArrowRight className="w-4 h-4 text-gray-400 -mt-2" />
            </div>

            {/* Target Entity */}
            <button
              onClick={() => {
                selectRelationship(null);
                selectEntity(relationship.targetEntityId);
              }}
              className="flex-1 p-2 rounded-lg border border-light-border dark:border-dark-border hover:border-accent-primary hover:bg-accent-primary/5 transition-colors text-center"
            >
              <div className="flex items-center justify-center gap-1 text-gray-500 dark:text-gray-400 mb-1">
                <Table2 className="w-3 h-3" />
                <span className="text-xs">Target</span>
              </div>
              <p className="font-medium text-sm truncate">{targetEntity?.name || 'Unknown'}</p>
              <p className="text-xs text-accent-primary mt-1">{relationship.targetCardinality}</p>
            </button>
          </div>
        </div>
      </div>

      {/* Cardinality */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Cardinality
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Source Side</label>
            <InlineSelect
              value={relationship.sourceCardinality}
              options={CARDINALITY_OPTIONS}
              onSave={(value) => handleUpdate({ sourceCardinality: value as Cardinality })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Target Side</label>
            <InlineSelect
              value={relationship.targetCardinality}
              options={CARDINALITY_OPTIONS}
              onSave={(value) => handleUpdate({ targetCardinality: value as Cardinality })}
            />
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="p-3 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          <strong>Reading:</strong> Each <span className="text-accent-primary">{sourceEntity?.name || 'source'}</span>{' '}
          ({relationship.sourceCardinality}) relates to{' '}
          ({relationship.targetCardinality}) <span className="text-accent-primary">{targetEntity?.name || 'target'}</span>
        </p>
      </div>

      {/* Quick Actions */}
      <div className="pt-2 border-t border-light-border dark:border-dark-border">
        <button
          onClick={() => selectRelationship(null)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Deselect relationship
        </button>
      </div>
    </div>
  );
}
