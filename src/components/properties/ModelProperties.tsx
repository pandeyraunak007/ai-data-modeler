'use client';

import { useState } from 'react';
import { useModel } from '@/context/ModelContext';
import { DatabaseType, Entity, generateId, calculateEntityHeight, DEFAULT_ENTITY_WIDTH } from '@/types/model';
import { InlineEdit, InlineSelect } from './InlineEdit';
import { Database, Table2, GitBranch, Calendar, Clock, Plus, X, Check } from 'lucide-react';

const DATABASE_OPTIONS = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sqlserver', label: 'SQL Server' },
  { value: 'oracle', label: 'Oracle' },
  { value: 'sqlite', label: 'SQLite' },
];

export default function ModelProperties() {
  const { model, updateModel, addEntity, selectEntity } = useModel();
  const [isAddingEntity, setIsAddingEntity] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');

  if (!model) return null;

  const handleAddEntity = () => {
    if (!newEntityName.trim()) return;

    const newEntity: Entity = {
      id: generateId(),
      name: newEntityName.trim(),
      physicalName: newEntityName.trim().toLowerCase().replace(/\s+/g, '_'),
      description: '',
      category: 'standard',
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      width: DEFAULT_ENTITY_WIDTH,
      height: calculateEntityHeight(1),
      attributes: [
        {
          id: generateId(),
          name: 'id',
          type: 'UUID',
          isPrimaryKey: true,
          isForeignKey: false,
          isRequired: true,
          isUnique: true,
          isIndexed: false,
        },
      ],
    };

    addEntity(newEntity);
    selectEntity(newEntity.id);
    setNewEntityName('');
    setIsAddingEntity(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddEntity();
    } else if (e.key === 'Escape') {
      setNewEntityName('');
      setIsAddingEntity(false);
    }
  };

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
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Entities ({model.entities.length})
          </h3>
          <button
            onClick={() => setIsAddingEntity(true)}
            className="p-1 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            title="Add entity"
          >
            <Plus className="w-4 h-4 text-accent-primary" />
          </button>
        </div>

        {/* Quick Add Entity Form */}
        {isAddingEntity && (
          <div className="flex items-center gap-2 p-2 bg-light-card dark:bg-dark-card rounded-lg border border-accent-primary">
            <input
              type="text"
              value={newEntityName}
              onChange={(e) => setNewEntityName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Entity name..."
              className="flex-1 px-2 py-1 text-sm bg-transparent border-none outline-none placeholder:text-gray-400"
              autoFocus
            />
            <button
              onClick={handleAddEntity}
              disabled={!newEntityName.trim()}
              className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Add (Enter)"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setNewEntityName('');
                setIsAddingEntity(false);
              }}
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
              title="Cancel (Escape)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-1">
          {model.entities.map((entity) => (
            <EntityListItem key={entity.id} entity={entity} />
          ))}
          {model.entities.length === 0 && !isAddingEntity && (
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
