'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DataModel, Entity, Relationship, createEmptyModel, generateId } from '@/types/model';

type ViewMode = 'logical' | 'physical';

interface ModelState {
  model: DataModel | null;
  selectedEntityId: string | null;
  selectedRelationshipId: string | null;
  isGenerating: boolean;
  error: string | null;
  viewMode: ViewMode;
}

interface ModelContextType extends ModelState {
  // Model operations
  setModel: (model: DataModel | null) => void;
  updateModel: (updates: Partial<DataModel>) => void;
  clearModel: () => void;

  // Entity operations
  addEntity: (entity: Entity) => void;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;
  selectEntity: (id: string | null) => void;

  // Relationship operations
  addRelationship: (relationship: Relationship) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  deleteRelationship: (id: string) => void;
  selectRelationship: (id: string | null) => void;

  // Generation state
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;

  // View mode
  setViewMode: (mode: ViewMode) => void;

  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
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
  });

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

  const setModel = useCallback((model: DataModel | null) => {
    setState(prev => ({
      ...prev,
      model,
      selectedEntityId: null,
      selectedRelationshipId: null,
      error: null,
    }));
  }, []);

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

  const addEntity = useCallback((entity: Entity) => {
    setState(prev => {
      if (!prev.model) return prev;
      return {
        ...prev,
        model: {
          ...prev.model,
          entities: [...prev.model.entities, entity],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const updateEntity = useCallback((id: string, updates: Partial<Entity>) => {
    setState(prev => {
      if (!prev.model) return prev;
      return {
        ...prev,
        model: {
          ...prev.model,
          entities: prev.model.entities.map(e =>
            e.id === id ? { ...e, ...updates } : e
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const deleteEntity = useCallback((id: string) => {
    setState(prev => {
      if (!prev.model) return prev;
      return {
        ...prev,
        model: {
          ...prev.model,
          entities: prev.model.entities.filter(e => e.id !== id),
          // Also remove relationships connected to this entity
          relationships: prev.model.relationships.filter(
            r => r.sourceEntityId !== id && r.targetEntityId !== id
          ),
          updatedAt: new Date().toISOString(),
        },
        selectedEntityId: prev.selectedEntityId === id ? null : prev.selectedEntityId,
      };
    });
  }, []);

  const selectEntity = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedEntityId: id,
      selectedRelationshipId: null,
    }));
  }, []);

  const addRelationship = useCallback((relationship: Relationship) => {
    setState(prev => {
      if (!prev.model) return prev;
      return {
        ...prev,
        model: {
          ...prev.model,
          relationships: [...prev.model.relationships, relationship],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const updateRelationship = useCallback((id: string, updates: Partial<Relationship>) => {
    setState(prev => {
      if (!prev.model) return prev;
      return {
        ...prev,
        model: {
          ...prev.model,
          relationships: prev.model.relationships.map(r =>
            r.id === id ? { ...r, ...updates } : r
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  const deleteRelationship = useCallback((id: string) => {
    setState(prev => {
      if (!prev.model) return prev;
      return {
        ...prev,
        model: {
          ...prev.model,
          relationships: prev.model.relationships.filter(r => r.id !== id),
          updatedAt: new Date().toISOString(),
        },
        selectedRelationshipId: prev.selectedRelationshipId === id ? null : prev.selectedRelationshipId,
      };
    });
  }, []);

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
