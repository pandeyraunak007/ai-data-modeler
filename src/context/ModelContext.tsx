'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DataModel, Entity, Relationship, createEmptyModel, generateId } from '@/types/model';

type ViewMode = 'logical' | 'physical';

// History entry for undo/redo
export interface HistoryEntry {
  id: string;
  timestamp: string;
  description: string;
  type: 'add' | 'modify' | 'delete' | 'batch' | 'import' | 'generate';
  affectedItems: {
    entities?: string[];
    relationships?: string[];
    attributes?: { entityId: string; attributeId: string }[];
  };
  modelSnapshot: DataModel;
}

const MAX_HISTORY_SIZE = 50;

interface ModelState {
  model: DataModel | null;
  selectedEntityId: string | null;
  selectedRelationshipId: string | null;
  isGenerating: boolean;
  error: string | null;
  viewMode: ViewMode;
  // History state for undo/redo
  history: HistoryEntry[];
  historyIndex: number;
}

interface ModelContextType extends ModelState {
  // Model operations
  setModel: (model: DataModel | null, description?: string) => void;
  updateModel: (updates: Partial<DataModel>) => void;
  clearModel: () => void;

  // Entity operations
  addEntity: (entity: Entity, description?: string) => void;
  updateEntity: (id: string, updates: Partial<Entity>, description?: string) => void;
  deleteEntity: (id: string, description?: string) => void;
  selectEntity: (id: string | null) => void;

  // Relationship operations
  addRelationship: (relationship: Relationship, description?: string) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>, description?: string) => void;
  deleteRelationship: (id: string, description?: string) => void;
  selectRelationship: (id: string | null) => void;

  // Generation state
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;

  // View mode
  setViewMode: (mode: ViewMode) => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;

  // Undo/Redo operations
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  pushToHistory: (description: string, type: HistoryEntry['type'], affectedItems?: HistoryEntry['affectedItems']) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

const STORAGE_KEY = 'ai-data-modeler-model';

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModelState>({
    model: null,
    selectedEntityId: null,
    selectedRelationshipId: null,
    isGenerating: false,
    error: null,
    viewMode: 'logical',
    history: [],
    historyIndex: -1,
  });

  // Helper to create a history entry
  const createHistoryEntry = useCallback((
    description: string,
    type: HistoryEntry['type'],
    modelSnapshot: DataModel,
    affectedItems: HistoryEntry['affectedItems'] = {}
  ): HistoryEntry => ({
    id: generateId(),
    timestamp: new Date().toISOString(),
    description,
    type,
    affectedItems,
    modelSnapshot: JSON.parse(JSON.stringify(modelSnapshot)), // Deep clone
  }), []);

  // Push to history (called before making changes)
  const pushToHistory = useCallback((
    description: string,
    type: HistoryEntry['type'],
    affectedItems: HistoryEntry['affectedItems'] = {}
  ) => {
    setState(prev => {
      if (!prev.model) return prev;

      // Remove any future history if we're not at the end
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);

      // Add the new entry
      const entry = createHistoryEntry(description, type, prev.model, affectedItems);
      newHistory.push(entry);

      // Limit history size
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }

      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, [createHistoryEntry]);

  // Undo - restore previous state
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < 0 || prev.history.length === 0) return prev;

      const currentIndex = prev.historyIndex;
      const newIndex = currentIndex - 1;

      if (newIndex < 0) {
        // At the beginning, restore from first history entry
        return prev;
      }

      const previousEntry = prev.history[newIndex];

      return {
        ...prev,
        model: JSON.parse(JSON.stringify(previousEntry.modelSnapshot)),
        historyIndex: newIndex,
        selectedEntityId: null,
        selectedRelationshipId: null,
      };
    });
  }, []);

  // Redo - restore next state
  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;

      const newIndex = prev.historyIndex + 1;
      const nextEntry = prev.history[newIndex];

      return {
        ...prev,
        model: JSON.parse(JSON.stringify(nextEntry.modelSnapshot)),
        historyIndex: newIndex,
        selectedEntityId: null,
        selectedRelationshipId: null,
      };
    });
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: [],
      historyIndex: -1,
    }));
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Auto-save when model changes
  useEffect(() => {
    if (state.model) {
      const timeout = setTimeout(() => {
        saveToLocalStorage();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [state.model]);

  const setModel = useCallback((model: DataModel | null, description?: string) => {
    setState(prev => {
      // If setting a new model and we have a previous model, save to history
      let newHistory = prev.history;
      let newHistoryIndex = prev.historyIndex;

      if (model && prev.model && description) {
        const entry = createHistoryEntry(description, 'generate', prev.model);
        newHistory = [...prev.history.slice(0, prev.historyIndex + 1), entry];
        if (newHistory.length > MAX_HISTORY_SIZE) {
          newHistory.shift();
        }
        newHistoryIndex = newHistory.length - 1;
      } else if (model && !prev.model) {
        // First model, initialize history with it
        const entry = createHistoryEntry(description || 'Initial model', 'generate', model);
        newHistory = [entry];
        newHistoryIndex = 0;
      }

      return {
        ...prev,
        model,
        selectedEntityId: null,
        selectedRelationshipId: null,
        error: null,
        history: newHistory,
        historyIndex: newHistoryIndex,
      };
    });
  }, [createHistoryEntry]);

  const updateModel = useCallback((updates: Partial<DataModel>) => {
    setState(prev => {
      if (!prev.model) return prev;
      return {
        ...prev,
        model: {
          ...prev.model,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const clearModel = useCallback(() => {
    setState(prev => ({
      ...prev,
      model: null,
      selectedEntityId: null,
      selectedRelationshipId: null,
    }));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addEntity = useCallback((entity: Entity, description?: string) => {
    setState(prev => {
      if (!prev.model) return prev;

      // Save current state to history before making changes
      const entry = createHistoryEntry(
        description || `Add entity: ${entity.name}`,
        'add',
        prev.model,
        { entities: [entity.id] }
      );
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), entry];

      return {
        ...prev,
        model: {
          ...prev.model,
          entities: [...prev.model.entities, entity],
          updatedAt: new Date().toISOString(),
        },
        history: newHistory.slice(-MAX_HISTORY_SIZE),
        historyIndex: Math.min(newHistory.length - 1, MAX_HISTORY_SIZE - 1),
      };
    });
  }, [createHistoryEntry]);

  const updateEntity = useCallback((id: string, updates: Partial<Entity>, description?: string) => {
    setState(prev => {
      if (!prev.model) return prev;

      const entity = prev.model.entities.find(e => e.id === id);
      // Only track in history if it's a significant change (not just position)
      const isPositionOnlyChange = Object.keys(updates).every(k => k === 'x' || k === 'y');

      let newHistory = prev.history;
      let newHistoryIndex = prev.historyIndex;

      if (!isPositionOnlyChange && entity) {
        const entry = createHistoryEntry(
          description || `Modify entity: ${entity.name}`,
          'modify',
          prev.model,
          { entities: [id] }
        );
        newHistory = [...prev.history.slice(0, prev.historyIndex + 1), entry].slice(-MAX_HISTORY_SIZE);
        newHistoryIndex = newHistory.length - 1;
      }

      return {
        ...prev,
        model: {
          ...prev.model,
          entities: prev.model.entities.map(e =>
            e.id === id ? { ...e, ...updates } : e
          ),
          updatedAt: new Date().toISOString(),
        },
        history: newHistory,
        historyIndex: newHistoryIndex,
      };
    });
  }, [createHistoryEntry]);

  const deleteEntity = useCallback((id: string, description?: string) => {
    setState(prev => {
      if (!prev.model) return prev;

      const entity = prev.model.entities.find(e => e.id === id);
      const affectedRelationships = prev.model.relationships
        .filter(r => r.sourceEntityId === id || r.targetEntityId === id)
        .map(r => r.id);

      const entry = createHistoryEntry(
        description || `Delete entity: ${entity?.name || id}`,
        'delete',
        prev.model,
        { entities: [id], relationships: affectedRelationships }
      );
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), entry].slice(-MAX_HISTORY_SIZE);

      return {
        ...prev,
        model: {
          ...prev.model,
          entities: prev.model.entities.filter(e => e.id !== id),
          relationships: prev.model.relationships.filter(
            r => r.sourceEntityId !== id && r.targetEntityId !== id
          ),
          updatedAt: new Date().toISOString(),
        },
        selectedEntityId: prev.selectedEntityId === id ? null : prev.selectedEntityId,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, [createHistoryEntry]);

  const selectEntity = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedEntityId: id,
      selectedRelationshipId: null,
    }));
  }, []);

  const addRelationship = useCallback((relationship: Relationship, description?: string) => {
    setState(prev => {
      if (!prev.model) return prev;

      const entry = createHistoryEntry(
        description || `Add relationship: ${relationship.name || 'New relationship'}`,
        'add',
        prev.model,
        { relationships: [relationship.id] }
      );
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), entry].slice(-MAX_HISTORY_SIZE);

      return {
        ...prev,
        model: {
          ...prev.model,
          relationships: [...prev.model.relationships, relationship],
          updatedAt: new Date().toISOString(),
        },
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, [createHistoryEntry]);

  const updateRelationship = useCallback((id: string, updates: Partial<Relationship>, description?: string) => {
    setState(prev => {
      if (!prev.model) return prev;

      const relationship = prev.model.relationships.find(r => r.id === id);
      const entry = createHistoryEntry(
        description || `Modify relationship: ${relationship?.name || id}`,
        'modify',
        prev.model,
        { relationships: [id] }
      );
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), entry].slice(-MAX_HISTORY_SIZE);

      return {
        ...prev,
        model: {
          ...prev.model,
          relationships: prev.model.relationships.map(r =>
            r.id === id ? { ...r, ...updates } : r
          ),
          updatedAt: new Date().toISOString(),
        },
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, [createHistoryEntry]);

  const deleteRelationship = useCallback((id: string, description?: string) => {
    setState(prev => {
      if (!prev.model) return prev;

      const relationship = prev.model.relationships.find(r => r.id === id);
      const entry = createHistoryEntry(
        description || `Delete relationship: ${relationship?.name || id}`,
        'delete',
        prev.model,
        { relationships: [id] }
      );
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), entry].slice(-MAX_HISTORY_SIZE);

      return {
        ...prev,
        model: {
          ...prev.model,
          relationships: prev.model.relationships.filter(r => r.id !== id),
          updatedAt: new Date().toISOString(),
        },
        selectedRelationshipId: prev.selectedRelationshipId === id ? null : prev.selectedRelationshipId,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, [createHistoryEntry]);

  const selectRelationship = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedRelationshipId: id,
      selectedEntityId: null,
    }));
  }, []);

  const setIsGenerating = useCallback((isGenerating: boolean) => {
    setState(prev => ({ ...prev, isGenerating }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setViewMode = useCallback((viewMode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode }));
  }, []);

  const saveToLocalStorage = useCallback(() => {
    if (state.model) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.model));
    }
  }, [state.model]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const model = JSON.parse(saved) as DataModel;
        setState(prev => ({ ...prev, model }));
        return true;
      }
    } catch (error) {
      console.error('Failed to load model from localStorage:', error);
    }
    return false;
  }, []);

  // Computed values for undo/redo availability
  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  const value: ModelContextType = {
    ...state,
    setModel,
    updateModel,
    clearModel,
    addEntity,
    updateEntity,
    deleteEntity,
    selectEntity,
    addRelationship,
    updateRelationship,
    deleteRelationship,
    selectRelationship,
    setIsGenerating,
    setError,
    setViewMode,
    saveToLocalStorage,
    loadFromLocalStorage,
    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    pushToHistory,
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}
