'use client';

import { useModel } from '@/context/ModelContext';
import { Entity, Attribute, calculateEntityHeight, generateId } from '@/types/model';
import { InlineEdit, InlineSelect, InlineCheckbox } from './InlineEdit';
import { Key, Link, Hash, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const CATEGORY_OPTIONS = [
  { value: 'standard', label: 'Standard Table' },
  { value: 'lookup', label: 'Lookup Table' },
  { value: 'junction', label: 'Junction Table' },
  { value: 'view', label: 'View' },
];

const DATA_TYPES = [
  { value: 'INT', label: 'INT' },
  { value: 'BIGINT', label: 'BIGINT' },
  { value: 'VARCHAR(255)', label: 'VARCHAR(255)' },
  { value: 'VARCHAR(50)', label: 'VARCHAR(50)' },
  { value: 'TEXT', label: 'TEXT' },
  { value: 'BOOLEAN', label: 'BOOLEAN' },
  { value: 'DATE', label: 'DATE' },
  { value: 'DATETIME', label: 'DATETIME' },
  { value: 'TIMESTAMP', label: 'TIMESTAMP' },
  { value: 'DECIMAL(10,2)', label: 'DECIMAL(10,2)' },
  { value: 'FLOAT', label: 'FLOAT' },
  { value: 'JSON', label: 'JSON' },
  { value: 'UUID', label: 'UUID' },
];

interface EntityPropertiesProps {
  entity: Entity;
}

export default function EntityProperties({ entity }: EntityPropertiesProps) {
  const { updateEntity, selectEntity } = useModel();
  const [expandedAttrs, setExpandedAttrs] = useState<Set<string>>(new Set());

  const handleUpdateEntity = (updates: Partial<Entity>) => {
    updateEntity(entity.id, updates);
  };

  const handleUpdateAttribute = (attrId: string, updates: Partial<Attribute>) => {
    const newAttrs = entity.attributes.map(attr =>
      attr.id === attrId ? { ...attr, ...updates } : attr
    );
    updateEntity(entity.id, {
      attributes: newAttrs,
      height: calculateEntityHeight(newAttrs.length),
    });
  };

  const handleAddAttribute = () => {
    const newAttr: Attribute = {
      id: generateId(),
      name: 'new_column',
      type: 'VARCHAR(255)',
      isPrimaryKey: false,
      isForeignKey: false,
      isRequired: false,
      isUnique: false,
      isIndexed: false,
    };
    const newAttrs = [...entity.attributes, newAttr];
    updateEntity(entity.id, {
      attributes: newAttrs,
      height: calculateEntityHeight(newAttrs.length),
    });
    setExpandedAttrs(prev => {
      const next = new Set(Array.from(prev));
      next.add(newAttr.id);
      return next;
    });
  };

  const handleDeleteAttribute = (attrId: string) => {
    const newAttrs = entity.attributes.filter(attr => attr.id !== attrId);
    updateEntity(entity.id, {
      attributes: newAttrs,
      height: calculateEntityHeight(newAttrs.length),
    });
  };

  const toggleAttrExpanded = (attrId: string) => {
    setExpandedAttrs(prev => {
      const next = new Set(Array.from(prev));
      if (next.has(attrId)) {
        next.delete(attrId);
      } else {
        next.add(attrId);
      }
      return next;
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Entity Info */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Entity Details
        </h3>

        <div className="space-y-2">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
            <InlineEdit
              value={entity.name}
              onSave={(value) => handleUpdateEntity({
                name: value,
                physicalName: value.toLowerCase().replace(/\s+/g, '_'),
              })}
              placeholder="Entity name"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Physical Name (SQL)</label>
            <InlineEdit
              value={entity.physicalName || ''}
              onSave={(value) => handleUpdateEntity({ physicalName: value })}
              placeholder="table_name"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Category</label>
            <InlineSelect
              value={entity.category || 'standard'}
              options={CATEGORY_OPTIONS}
              onSave={(value) => handleUpdateEntity({ category: value as Entity['category'] })}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Description</label>
            <InlineEdit
              value={entity.description || ''}
              onSave={(value) => handleUpdateEntity({ description: value })}
              placeholder="Add description"
              type="textarea"
            />
          </div>
        </div>
      </div>

      {/* Attributes Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Attributes ({entity.attributes.length})
          </h3>
          <button
            onClick={handleAddAttribute}
            className="p-1 rounded hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            title="Add attribute"
          >
            <Plus className="w-4 h-4 text-accent-primary" />
          </button>
        </div>

        <div className="space-y-1">
          {entity.attributes.map((attr) => (
            <AttributeItem
              key={attr.id}
              attribute={attr}
              isExpanded={expandedAttrs.has(attr.id)}
              onToggle={() => toggleAttrExpanded(attr.id)}
              onUpdate={(updates) => handleUpdateAttribute(attr.id, updates)}
              onDelete={() => handleDeleteAttribute(attr.id)}
            />
          ))}
          {entity.attributes.length === 0 && (
            <p className="text-sm text-gray-500 italic py-2">No attributes defined</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-2 border-t border-light-border dark:border-dark-border">
        <button
          onClick={() => selectEntity(null)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Deselect entity
        </button>
      </div>
    </div>
  );
}

interface AttributeItemProps {
  attribute: Attribute;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<Attribute>) => void;
  onDelete: () => void;
}

function AttributeItem({ attribute, isExpanded, onToggle, onUpdate, onDelete }: AttributeItemProps) {
  return (
    <div className="border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-light-card dark:bg-dark-card cursor-pointer hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
        onClick={onToggle}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}

        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {attribute.isPrimaryKey && <Key className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
          {attribute.isForeignKey && !attribute.isPrimaryKey && (
            <Link className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          )}
          {attribute.isIndexed && !attribute.isPrimaryKey && !attribute.isForeignKey && (
            <Hash className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          )}
          <span className="font-medium text-sm truncate">{attribute.name}</span>
        </div>

        <span className="text-xs text-gray-500 flex-shrink-0">{attribute.type}</span>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 space-y-3 border-t border-light-border dark:border-dark-border bg-white dark:bg-dark-bg">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Name</label>
              <InlineEdit
                value={attribute.name}
                onSave={(value) => onUpdate({ name: value })}
                placeholder="Column name"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Type</label>
              <InlineSelect
                value={attribute.type}
                options={DATA_TYPES}
                onSave={(value) => onUpdate({ type: value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400">Default Value</label>
            <InlineEdit
              value={attribute.defaultValue || ''}
              onSave={(value) => onUpdate({ defaultValue: value || undefined })}
              placeholder="No default"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Constraints</label>
            <div className="grid grid-cols-2 gap-1">
              <InlineCheckbox
                label="Primary Key"
                checked={attribute.isPrimaryKey || false}
                onChange={(checked) => onUpdate({
                  isPrimaryKey: checked,
                  isRequired: checked ? true : attribute.isRequired,
                })}
              />
              <InlineCheckbox
                label="Foreign Key"
                checked={attribute.isForeignKey || false}
                onChange={(checked) => onUpdate({ isForeignKey: checked })}
              />
              <InlineCheckbox
                label="Required"
                checked={attribute.isRequired || false}
                onChange={(checked) => onUpdate({ isRequired: checked })}
              />
              <InlineCheckbox
                label="Unique"
                checked={attribute.isUnique || false}
                onChange={(checked) => onUpdate({ isUnique: checked })}
              />
              <InlineCheckbox
                label="Indexed"
                checked={attribute.isIndexed || false}
                onChange={(checked) => onUpdate({ isIndexed: checked })}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
