'use client';

import { useModel } from '@/context/ModelContext';
import { Settings2, X } from 'lucide-react';
import ModelProperties from './ModelProperties';
import EntityProperties from './EntityProperties';
import RelationshipProperties from './RelationshipProperties';

interface PropertiesPanelProps {
  onCollapse?: () => void;
}

export default function PropertiesPanel({ onCollapse }: PropertiesPanelProps) {
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

  return (
    <div className="w-full bg-white dark:bg-dark-bg flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-accent-primary" />
          <span className="font-medium">{getPanelTitle()}</span>
        </div>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="p-1.5 hover:bg-light-hover dark:hover:bg-dark-hover rounded transition-colors"
            title="Hide Properties"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
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
