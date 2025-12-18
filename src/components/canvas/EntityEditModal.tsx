'use client';

import { useState, useEffect } from 'react';
import { Entity, Attribute, generateId, calculateEntityHeight } from '@/types/model';
import {
  X,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Key,
  Link,
  Hash,
  AlertCircle,
} from 'lucide-react';

interface EntityEditModalProps {
  entity: Entity;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Entity>) => void;
  onDelete: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'standard', label: 'Standard Table' },
  { value: 'lookup', label: 'Lookup Table' },
  { value: 'junction', label: 'Junction Table' },
  { value: 'view', label: 'View' },
];

const DATA_TYPES = [
  'INT',
  'BIGINT',
  'SMALLINT',
  'VARCHAR(255)',
  'VARCHAR(50)',
  'TEXT',
  'CHAR(10)',
  'BOOLEAN',
  'DATE',
  'DATETIME',
  'TIMESTAMP',
  'DECIMAL(10,2)',
  'FLOAT',
  'DOUBLE',
  'BLOB',
  'JSON',
  'UUID',
];

export default function EntityEditModal({
  entity,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EntityEditModalProps) {
  const [name, setName] = useState(entity.name);
  const [description, setDescription] = useState(entity.description || '');
  const [category, setCategory] = useState<'standard' | 'lookup' | 'junction' | 'view'>(entity.category || 'standard');
  const [attributes, setAttributes] = useState<Attribute[]>(entity.attributes);
  const [editingAttrId, setEditingAttrId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset state when entity changes
  useEffect(() => {
    setName(entity.name);
    setDescription(entity.description || '');
    setCategory(entity.category || 'standard');
    setAttributes(entity.attributes);
    setEditingAttrId(null);
    setShowDeleteConfirm(false);
  }, [entity]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updates: Partial<Entity> = {
      name,
      physicalName: name.toLowerCase().replace(/\s+/g, '_'),
      description,
      category: category as Entity['category'],
      attributes,
      height: calculateEntityHeight(attributes.length),
    };
    onSave(updates);
    onClose();
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
    setAttributes([...attributes, newAttr]);
    setEditingAttrId(newAttr.id);
  };

  const handleUpdateAttribute = (id: string, updates: Partial<Attribute>) => {
    setAttributes(attrs =>
      attrs.map(attr => (attr.id === id ? { ...attr, ...updates } : attr))
    );
  };

  const handleDeleteAttribute = (id: string) => {
    setAttributes(attrs => attrs.filter(attr => attr.id !== id));
    if (editingAttrId === id) {
      setEditingAttrId(null);
    }
  };

  const handleMoveAttribute = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= attributes.length) return;

    const newAttrs = [...attributes];
    [newAttrs[index], newAttrs[newIndex]] = [newAttrs[newIndex], newAttrs[index]];
    setAttributes(newAttrs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] mx-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-light-border dark:border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Entity
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Entity Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entity Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
              placeholder="Enter entity name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all resize-none"
              placeholder="Optional description"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'standard' | 'lookup' | 'junction' | 'view')}
              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Attributes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Attributes ({attributes.length})
              </label>
              <button
                onClick={handleAddAttribute}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-accent-primary hover:bg-accent-primary-dark text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {attributes.map((attr, index) => (
                <div
                  key={attr.id}
                  className={`p-3 rounded-lg border transition-all ${
                    editingAttrId === attr.id
                      ? 'border-accent-primary bg-accent-primary/5'
                      : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg'
                  }`}
                >
                  {editingAttrId === attr.id ? (
                    // Editing mode
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={attr.name}
                          onChange={(e) =>
                            handleUpdateAttribute(attr.id, { name: e.target.value })
                          }
                          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-card"
                          placeholder="Column name"
                          autoFocus
                        />
                        <select
                          value={attr.type}
                          onChange={(e) =>
                            handleUpdateAttribute(attr.id, { type: e.target.value })
                          }
                          className="px-3 py-1.5 text-sm rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-card"
                        >
                          {DATA_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attr.isPrimaryKey}
                            onChange={(e) =>
                              handleUpdateAttribute(attr.id, {
                                isPrimaryKey: e.target.checked,
                                isRequired: e.target.checked ? true : attr.isRequired,
                              })
                            }
                            className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
                          />
                          <Key className="w-3.5 h-3.5 text-amber-500" />
                          Primary Key
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attr.isForeignKey}
                            onChange={(e) =>
                              handleUpdateAttribute(attr.id, { isForeignKey: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
                          />
                          <Link className="w-3.5 h-3.5 text-blue-500" />
                          Foreign Key
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attr.isRequired}
                            onChange={(e) =>
                              handleUpdateAttribute(attr.id, { isRequired: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
                          />
                          Required
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attr.isUnique}
                            onChange={(e) =>
                              handleUpdateAttribute(attr.id, { isUnique: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
                          />
                          Unique
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attr.isIndexed}
                            onChange={(e) =>
                              handleUpdateAttribute(attr.id, { isIndexed: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary"
                          />
                          <Hash className="w-3.5 h-3.5 text-gray-500" />
                          Indexed
                        </label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingAttrId(null)}
                          className="px-3 py-1 text-sm rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMoveAttribute(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-light-hover dark:hover:bg-dark-hover disabled:opacity-30"
                        >
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {attr.isPrimaryKey && <Key className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                        {attr.isForeignKey && !attr.isPrimaryKey && (
                          <Link className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">{attr.name}</span>
                        <span className="text-gray-500 text-sm">{attr.type}</span>
                        {attr.isRequired && !attr.isPrimaryKey && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingAttrId(attr.id)}
                          className="px-2 py-1 text-xs rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAttribute(attr.id)}
                          className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {attributes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No attributes defined</p>
                  <button
                    onClick={handleAddAttribute}
                    className="mt-2 text-accent-primary hover:underline text-sm"
                  >
                    Add first attribute
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-500">Delete this entity?</span>
                <button
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Entity
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent-primary hover:bg-accent-primary-dark text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
