'use client';

import React, { useMemo, useState } from 'react';
import { useModel } from '@/context/ModelContext';
import {
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Table2,
  Key,
  Link,
  FileText,
  RefreshCw,
} from 'lucide-react';

type ValidationSeverity = 'error' | 'warning' | 'info';

interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: string;
  message: string;
  entityId?: string;
  entityName?: string;
  attributeId?: string;
  attributeName?: string;
  suggestion?: string;
}

interface ModelValidationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModelValidation({ isOpen, onClose }: ModelValidationProps) {
  const { model, selectEntity } = useModel();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Errors', 'Warnings']));
  const [filter, setFilter] = useState<'all' | ValidationSeverity>('all');

  // Run validation
  const issues = useMemo(() => {
    if (!model) return [];

    const validationIssues: ValidationIssue[] = [];
    let issueId = 0;

    const addIssue = (
      severity: ValidationSeverity,
      category: string,
      message: string,
      entityId?: string,
      entityName?: string,
      attributeId?: string,
      attributeName?: string,
      suggestion?: string
    ) => {
      validationIssues.push({
        id: `issue-${issueId++}`,
        severity,
        category,
        message,
        entityId,
        entityName,
        attributeId,
        attributeName,
        suggestion,
      });
    };

    // Check each entity
    model.entities.forEach((entity) => {
      // Check for missing primary key
      const hasPK = entity.attributes.some((attr) => attr.isPrimaryKey);
      if (!hasPK) {
        addIssue(
          'error',
          'Primary Keys',
          `Entity "${entity.name}" has no primary key defined`,
          entity.id,
          entity.name,
          undefined,
          undefined,
          'Add a primary key attribute to uniquely identify records'
        );
      }

      // Check for empty entities
      if (entity.attributes.length === 0) {
        addIssue(
          'warning',
          'Empty Entities',
          `Entity "${entity.name}" has no attributes`,
          entity.id,
          entity.name,
          undefined,
          undefined,
          'Add attributes to define the entity structure'
        );
      }

      // Check for missing description
      if (!entity.description || entity.description.trim() === '') {
        addIssue(
          'info',
          'Documentation',
          `Entity "${entity.name}" has no description`,
          entity.id,
          entity.name,
          undefined,
          undefined,
          'Add a description to document the entity purpose'
        );
      }

      // Check naming conventions (PascalCase for entities)
      const pascalCaseRegex = /^[A-Z][a-zA-Z0-9]*$/;
      if (!pascalCaseRegex.test(entity.name.replace(/\s/g, ''))) {
        addIssue(
          'info',
          'Naming Conventions',
          `Entity "${entity.name}" doesn't follow PascalCase naming convention`,
          entity.id,
          entity.name,
          undefined,
          undefined,
          'Consider using PascalCase (e.g., "CustomerOrder" instead of "customer_order")'
        );
      }

      // Check attributes
      entity.attributes.forEach((attr) => {
        // Check for vague attribute names
        const vagueNames = ['data', 'info', 'value', 'field', 'item', 'thing'];
        if (vagueNames.includes(attr.name.toLowerCase())) {
          addIssue(
            'warning',
            'Naming Conventions',
            `Attribute "${attr.name}" in "${entity.name}" has a vague name`,
            entity.id,
            entity.name,
            attr.id,
            attr.name,
            'Use more descriptive names that indicate the attribute purpose'
          );
        }

        // Check for missing types
        if (!attr.type || attr.type.trim() === '') {
          addIssue(
            'error',
            'Data Types',
            `Attribute "${attr.name}" in "${entity.name}" has no data type`,
            entity.id,
            entity.name,
            attr.id,
            attr.name,
            'Specify a data type for the attribute'
          );
        }

        // Check for FK without relationship
        if (attr.isForeignKey) {
          const hasRelationship = model.relationships.some(
            (rel) =>
              (rel.sourceEntityId === entity.id || rel.targetEntityId === entity.id) &&
              (rel.sourceAttribute === attr.name || rel.targetAttribute === attr.name)
          );
          if (!hasRelationship) {
            addIssue(
              'warning',
              'Relationships',
              `Foreign key "${attr.name}" in "${entity.name}" has no associated relationship`,
              entity.id,
              entity.name,
              attr.id,
              attr.name,
              'Create a relationship or remove the foreign key flag'
            );
          }
        }
      });

      // Check for orphan entities (no relationships)
      const hasRelationship = model.relationships.some(
        (rel) => rel.sourceEntityId === entity.id || rel.targetEntityId === entity.id
      );
      if (!hasRelationship && model.entities.length > 1) {
        addIssue(
          'warning',
          'Relationships',
          `Entity "${entity.name}" has no relationships with other entities`,
          entity.id,
          entity.name,
          undefined,
          undefined,
          'Consider adding relationships or confirm this entity should be standalone'
        );
      }
    });

    // Check for duplicate entity names
    const entityNames = model.entities.map((e) => e.name.toLowerCase());
    const duplicateNames = entityNames.filter((name, index) => entityNames.indexOf(name) !== index);
    duplicateNames.forEach((dupName) => {
      const entities = model.entities.filter((e) => e.name.toLowerCase() === dupName);
      entities.forEach((entity) => {
        addIssue(
          'error',
          'Duplicates',
          `Duplicate entity name: "${entity.name}"`,
          entity.id,
          entity.name,
          undefined,
          undefined,
          'Rename one of the entities to have unique names'
        );
      });
    });

    // Check relationships
    model.relationships.forEach((rel) => {
      const sourceEntity = model.entities.find((e) => e.id === rel.sourceEntityId);
      const targetEntity = model.entities.find((e) => e.id === rel.targetEntityId);

      // Check for missing entities
      if (!sourceEntity) {
        addIssue(
          'error',
          'Relationships',
          `Relationship references missing source entity`,
          undefined,
          undefined,
          undefined,
          undefined,
          'Delete this relationship or restore the source entity'
        );
      }

      if (!targetEntity) {
        addIssue(
          'error',
          'Relationships',
          `Relationship references missing target entity`,
          undefined,
          undefined,
          undefined,
          undefined,
          'Delete this relationship or restore the target entity'
        );
      }

      // Check for self-referencing without proper naming
      if (sourceEntity && targetEntity && sourceEntity.id === targetEntity.id) {
        if (!rel.name || !rel.name.toLowerCase().includes('self') && !rel.name.toLowerCase().includes('parent')) {
          addIssue(
            'info',
            'Relationships',
            `Self-referencing relationship in "${sourceEntity.name}" could use clearer naming`,
            sourceEntity.id,
            sourceEntity.name,
            undefined,
            undefined,
            'Consider naming like "ParentChild" or "Hierarchy" to clarify the relationship'
          );
        }
      }
    });

    // Model-level checks
    if (model.entities.length === 0) {
      addIssue(
        'warning',
        'Model Structure',
        'Model has no entities',
        undefined,
        undefined,
        undefined,
        undefined,
        'Add entities to start building your data model'
      );
    }

    if (!model.name || model.name.trim() === '') {
      addIssue(
        'info',
        'Documentation',
        'Model has no name',
        undefined,
        undefined,
        undefined,
        undefined,
        'Add a name to identify your model'
      );
    }

    return validationIssues;
  }, [model]);

  // Group issues by category
  const groupedIssues = useMemo(() => {
    const filtered = filter === 'all' ? issues : issues.filter((i) => i.severity === filter);
    const groups: Record<string, ValidationIssue[]> = {};

    filtered.forEach((issue) => {
      if (!groups[issue.category]) {
        groups[issue.category] = [];
      }
      groups[issue.category].push(issue);
    });

    return groups;
  }, [issues, filter]);

  // Count by severity
  const counts = useMemo(() => {
    return {
      error: issues.filter((i) => i.severity === 'error').length,
      warning: issues.filter((i) => i.severity === 'warning').length,
      info: issues.filter((i) => i.severity === 'info').length,
    };
  }, [issues]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleIssueClick = (issue: ValidationIssue) => {
    if (issue.entityId) {
      selectEntity(issue.entityId);
    }
  };

  const getSeverityIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityBg = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  if (!isOpen) return null;

  const isValid = counts.error === 0 && counts.warning === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] mx-4 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-light-border dark:border-dark-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isValid
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-orange-500 to-red-600'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Model Validation
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isValid
                  ? 'No critical issues found'
                  : `Found ${counts.error} errors, ${counts.warning} warnings`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-accent-primary text-white'
                : 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
            }`}
          >
            All ({issues.length})
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Errors ({counts.error})
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Warnings ({counts.warning})
          </button>
          <button
            onClick={() => setFilter('info')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filter === 'info'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Info ({counts.info})
          </button>
        </div>

        {/* Issues list */}
        <div className="flex-1 overflow-y-auto p-4">
          {Object.keys(groupedIssues).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {filter === 'all' ? 'Model looks great!' : `No ${filter}s found`}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {filter === 'all'
                  ? 'Your data model has no validation issues.'
                  : `Try checking other categories for issues.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(groupedIssues).map(([category, categoryIssues]) => (
                <div
                  key={category}
                  className="border border-light-border dark:border-dark-border rounded-xl overflow-hidden"
                >
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-light-card dark:bg-dark-bg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                      <span className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                        {categoryIssues.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {categoryIssues.some((i) => i.severity === 'error') && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      {categoryIssues.some((i) => i.severity === 'warning') && (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </button>

                  {/* Category issues */}
                  {expandedCategories.has(category) && (
                    <div className="divide-y divide-light-border dark:divide-dark-border">
                      {categoryIssues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => handleIssueClick(issue)}
                          className={`px-4 py-3 cursor-pointer hover:bg-light-hover dark:hover:bg-dark-hover transition-colors ${
                            issue.entityId ? '' : 'cursor-default'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {getSeverityIcon(issue.severity)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white">
                                {issue.message}
                              </p>
                              {issue.suggestion && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Suggestion: {issue.suggestion}
                                </p>
                              )}
                              {issue.entityName && (
                                <div className="flex items-center gap-1 mt-2">
                                  <Table2 className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-accent-primary">
                                    {issue.entityName}
                                    {issue.attributeName && ` → ${issue.attributeName}`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-bg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click on an issue to select the entity
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-accent-primary hover:bg-accent-primary-dark rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
