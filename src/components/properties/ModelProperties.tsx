'use client';

import { useModel } from '@/context/ModelContext';
import { DatabaseType } from '@/types/model';
import { InlineEdit, InlineSelect } from './InlineEdit';
import { Database, Table2, GitBranch, Calendar, Clock } from 'lucide-react';

const DATABASE_OPTIONS = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'sqlite', label: 'SQLite' },
];

export default function ModelProperties() {
  const { model, updateModel } = useModel();

  if (!model) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Model Info Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Model Information
        </h3>

        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
            <InlineEdit
              value={model.name}
              onSave={(value) => updateModel({ name: value })}
              placeholder="Enter model name"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Description</label>
            <InlineEdit
              value={model.description || ''}
              onSave={(value) => updateModel({ description: value })}
              placeholder="Add description"
              type="textarea"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Target Database</label>
            <InlineSelect
              value={model.targetDatabase}
              options={DATABASE_OPTIONS}
              onSave={(value) => updateModel({ targetDatabase: value as DatabaseType })}
            />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Statistics
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <Table2 className="w-4 h-4" />
              <span className="text-xs">Entities</span>
            </div>
            <p className="text-2xl font-semibold">{model.entities.length}</p>
          </div>

          <div className="p-3 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
              <GitBranch className="w-4 h-4" />
              <span className="text-xs">Relationships</span>
            </div>
            <p className="text-2xl font-semibold">{model.relationships.length}</p>
          </div>
        </div>

        <div className="p-3 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Database className="w-4 h-4" />
            <span className="text-xs">Total Attributes</span>
          </div>
          <p className="text-2xl font-semibold">
            {model.entities.reduce((sum, e) => sum + e.attributes.length, 0)}
          </p>
        </div>
      </div>

      {/* Timestamps Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          History
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Created:</span>
            <span className="text-xs">{formatDate(model.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Updated:</span>
            <span className="text-xs">{formatDate(model.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Entity List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Entities ({model.entities.length})
        </h3>

        <div className="space-y-1">
          {model.entities.map((entity) => (
            <EntityListItem key={entity.id} entity={entity} />
          ))}
          {model.entities.length === 0 && (
            <p className="text-sm text-gray-500 italic">No entities yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function EntityListItem({ entity }: { entity: { id: string; name: string; attributes: any[]; category?: string } }) {
  const { selectEntity } = useModel();

  return (
    <button
      onClick={() => selectEntity(entity.id)}
      className="w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
    >
      <span className="font-medium">{entity.name}</span>
      <span className="text-xs text-gray-500">{entity.attributes.length} cols</span>
    </button>
  );
}
