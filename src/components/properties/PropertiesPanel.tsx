'use client';

import { useState } from 'react';
import { useModel } from '@/context/ModelContext';
import { Settings2, X, ChevronRight } from 'lucide-react';
import ModelProperties from './ModelProperties';
import EntityProperties from './EntityProperties';
import RelationshipProperties from './RelationshipProperties';

export default function PropertiesPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { model, selectedEntityId, selectedRelationshipId } = useModel();

  // Get selected items
  const selectedEntity = model?.entities.find(e => e.id === selectedEntityId);
  const selectedRelationship = model?.relationships.find(r => r.id === selectedRelationshipId);

  // Determine panel title
  const getPanelTitle = () => {
    if (selectedEntity) return 'Entity Properties';
    if (selectedRelationship) return 'Relationship Properties';
    return 'Model Properties';
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed right-[340px] top-1/2 -translate-y-1/2 w-8 h-24 bg-dark-card hover:bg-dark-hover border border-dark-border rounded-l-lg flex items-center justify-center shadow-lg transition-all z-10"
        title="Show Properties"
      >
        <ChevronRight className="w-4 h-4 text-gray-400 rotate-180" />
      </button>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-dark-bg flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-accent-primary" />
          <span className="font-medium">{getPanelTitle()}</span>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 hover:bg-light-hover dark:hover:bg-dark-hover rounded transition-colors"
          title="Hide Properties"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedEntity ? (
          <EntityProperties entity={selectedEntity} />
        ) : selectedRelationship ? (
          <RelationshipProperties relationship={selectedRelationship} />
        ) : model ? (
          <ModelProperties />
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No model loaded</p>
          </div>
        )}
      </div>
    </div>
  );
}
