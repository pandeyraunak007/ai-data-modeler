'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useModel } from '@/context/ModelContext';
import { Search, X, Table2, Key, Link, Hash, Filter, ChevronDown } from 'lucide-react';

interface SearchResult {
  type: 'entity' | 'attribute';
  entityId: string;
  entityName: string;
  attributeId?: string;
  attributeName?: string;
  attributeType?: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  matchField: string;
}

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const { model, selectEntity } = useModel();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'entity' | 'attribute'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Search results
  const results = useMemo(() => {
    if (!model || !query.trim()) return [];

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    model.entities.forEach((entity) => {
      // Search entity names
      if (filterType !== 'attribute') {
        if (
          entity.name.toLowerCase().includes(lowerQuery) ||
          entity.physicalName?.toLowerCase().includes(lowerQuery) ||
          entity.description?.toLowerCase().includes(lowerQuery)
        ) {
          searchResults.push({
            type: 'entity',
            entityId: entity.id,
            entityName: entity.name,
            matchField: entity.name.toLowerCase().includes(lowerQuery)
              ? 'name'
              : entity.physicalName?.toLowerCase().includes(lowerQuery)
              ? 'physical name'
              : 'description',
          });
        }
      }

      // Search attributes
      if (filterType !== 'entity') {
        entity.attributes.forEach((attr) => {
          if (
            attr.name.toLowerCase().includes(lowerQuery) ||
            attr.type.toLowerCase().includes(lowerQuery)
          ) {
            searchResults.push({
              type: 'attribute',
              entityId: entity.id,
              entityName: entity.name,
              attributeId: attr.id,
              attributeName: attr.name,
              attributeType: attr.type,
              isPrimaryKey: attr.isPrimaryKey,
              isForeignKey: attr.isForeignKey,
              matchField: attr.name.toLowerCase().includes(lowerQuery) ? 'name' : 'type',
            });
          }
        });
      }
    });

    return searchResults.slice(0, 50); // Limit results
  }, [model, query, filterType]);

  // Handle result click
  const handleResultClick = useCallback(
    (result: SearchResult) => {
      selectEntity(result.entityId);
      onClose();
    },
    [selectEntity, onClose]
  );

  // Keyboard shortcut to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const input = document.getElementById('search-input');
      input?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Search modal */}
      <div className="relative w-full max-w-xl mx-4 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-light-border dark:border-dark-border overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-light-border dark:border-dark-border">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search entities, attributes, types..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-light-hover dark:hover:bg-dark-hover rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${
              showFilters || filterType !== 'all'
                ? 'bg-accent-primary/10 text-accent-primary'
                : 'hover:bg-light-hover dark:hover:bg-dark-hover text-gray-500'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-2 px-4 py-2 bg-light-card dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
            <span className="text-xs text-gray-500">Show:</span>
            {(['all', 'entity', 'attribute'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                  filterType === type
                    ? 'bg-accent-primary text-white'
                    : 'bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:bg-light-hover dark:hover:bg-dark-hover'
                }`}
              >
                {type === 'all' ? 'All' : type === 'entity' ? 'Entities' : 'Attributes'}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim() === '' ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Start typing to search</p>
              <p className="text-xs mt-1">Search by entity name, attribute name, or data type</p>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {results.map((result, index) => (
                <button
                  key={`${result.entityId}-${result.attributeId || 'entity'}-${index}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      result.type === 'entity'
                        ? 'bg-accent-primary/10 text-accent-primary'
                        : result.isPrimaryKey
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        : result.isForeignKey
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    }`}
                  >
                    {result.type === 'entity' ? (
                      <Table2 className="w-4 h-4" />
                    ) : result.isPrimaryKey ? (
                      <Key className="w-4 h-4" />
                    ) : result.isForeignKey ? (
                      <Link className="w-4 h-4" />
                    ) : (
                      <Hash className="w-4 h-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {result.type === 'entity' ? (
                      <>
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {result.entityName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Entity · matched {result.matchField}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {result.attributeName}
                          <span className="ml-2 text-xs font-normal text-gray-500">
                            {result.attributeType}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          in {result.entityName} · matched {result.matchField}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Badge */}
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${
                      result.type === 'entity'
                        ? 'bg-accent-primary/10 text-accent-primary'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-light-card dark:bg-dark-bg border-t border-light-border dark:border-dark-border text-xs text-gray-500">
          <span>{results.length} results</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
