'use client';

import { useState, useEffect } from 'react';
import { Relationship, Entity, Cardinality } from '@/types/model';
import { X, Save, Trash2, Link, ArrowRight } from 'lucide-react';

interface RelationshipEditModalProps {
  relationship: Relationship;
  entities: Entity[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Relationship>) => void;
  onDelete: () => void;
}

const CARDINALITY_OPTIONS: { value: Cardinality; label: string; description: string }[] = [
  { value: '1', label: 'One (1)', description: 'Exactly one' },
  { value: '0..1', label: 'Zero or One (0..1)', description: 'Optional, at most one' },
  { value: 'M', label: 'Many (M)', description: 'One or more' },
  { value: '0..M', label: 'Zero or Many (0..M)', description: 'Optional, any number' },
  { value: '1..M', label: 'One or Many (1..M)', description: 'At least one' },
];

const RELATIONSHIP_TYPES = [
  { value: 'identifying', label: 'Identifying', description: 'Child cannot exist without parent (solid line)' },
  { value: 'non-identifying', label: 'Non-Identifying', description: 'Child can exist independently (dashed line)' },
];

export default function RelationshipEditModal({
  relationship,
  entities,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: RelationshipEditModalProps) {
  const [name, setName] = useState(relationship.name || '');
  const [type, setType] = useState(relationship.type);
  const [sourceEntityId, setSourceEntityId] = useState(relationship.sourceEntityId);
  const [targetEntityId, setTargetEntityId] = useState(relationship.targetEntityId);
  const [sourceCardinality, setSourceCardinality] = useState(relationship.sourceCardinality);
  const [targetCardinality, setTargetCardinality] = useState(relationship.targetCardinality);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset state when relationship changes
  useEffect(() => {
    setName(relationship.name || '');
    setType(relationship.type);
    setSourceEntityId(relationship.sourceEntityId);
    setTargetEntityId(relationship.targetEntityId);
    setSourceCardinality(relationship.sourceCardinality);
    setTargetCardinality(relationship.targetCardinality);
    setShowDeleteConfirm(false);
  }, [relationship]);

  if (!isOpen) return null;

  const sourceEntity = entities.find(e => e.id === sourceEntityId);
  const targetEntity = entities.find(e => e.id === targetEntityId);

  const handleSave = () => {
    const updates: Partial<Relationship> = {
      name: name || undefined,
      type,
      sourceEntityId,
      targetEntityId,
      sourceCardinality,
      targetCardinality,
    };
    onSave(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-light-border dark:border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center">
              <Link className="w-5 h-5 text-accent-primary" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Relationship
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Relationship Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Relationship Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
              placeholder="e.g., has_many, belongs_to"
            />
          </div>

          {/* Relationship Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Relationship Type
            </label>
            <div className="space-y-2">
              {RELATIONSHIP_TYPES.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    type === opt.value
                      ? 'border-accent-primary bg-accent-primary/5'
                      : 'border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
                  }`}
                >
                  <input
                    type="radio"
                    name="relationship-type"
                    value={opt.value}
                    checked={type === opt.value}
                    onChange={() => setType(opt.value as Relationship['type'])}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-sm text-gray-500">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Visual representation */}
          <div className="p-4 bg-light-card dark:bg-dark-bg rounded-xl border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="px-3 py-2 bg-white dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border font-medium">
                  {sourceEntity?.name || 'Source'}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {sourceCardinality}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <div className={`w-12 h-0.5 ${type === 'identifying' ? 'bg-accent-primary' : 'bg-gray-400 border-dashed border-t-2 border-gray-400 h-0'}`} />
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="text-center">
                <div className="px-3 py-2 bg-white dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border font-medium">
                  {targetEntity?.name || 'Target'}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {targetCardinality}
                </div>
              </div>
            </div>
          </div>

          {/* Entities */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source Entity
              </label>
              <select
                value={sourceEntityId}
                onChange={(e) => setSourceEntityId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
              >
                {entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Entity
              </label>
              <select
                value={targetEntityId}
                onChange={(e) => setTargetEntityId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
              >
                {entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cardinality */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source Cardinality
              </label>
              <select
                value={sourceCardinality}
                onChange={(e) => setSourceCardinality(e.target.value as Cardinality)}
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
              >
                {CARDINALITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Cardinality
              </label>
              <select
                value={targetCardinality}
                onChange={(e) => setTargetCardinality(e.target.value as Cardinality)}
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
              >
                {CARDINALITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-500">Delete?</span>
                <button
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm hover:bg-light-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
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
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
