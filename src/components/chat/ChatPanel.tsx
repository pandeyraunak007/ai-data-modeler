'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useModel } from '@/context/ModelContext';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { parseModifyResponse } from '@/lib/prompts/modifyModel';
import { generateId, Entity, Attribute, Relationship, calculateEntityHeight, DEFAULT_ENTITY_WIDTH, ModelChange } from '@/types/model';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SuggestionChips from './SuggestionChips';
import { MessageSquare, X, Trash2 } from 'lucide-react';

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { model, updateEntity, addEntity, deleteEntity, addRelationship, deleteRelationship, updateRelationship } = useModel();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Apply model changes from AI response
  const applyChanges = useCallback((changes: any[]) => {
    const appliedChanges: ModelChange[] = [];

    changes.forEach((change) => {
      try {
        switch (change.type) {
          case 'add_entity':
            if (change.data) {
              const newEntity: Entity = {
                id: change.data.id || generateId(),
                name: change.data.name,
                physicalName: change.data.name?.toLowerCase().replace(/\s+/g, '_'),
                description: change.data.description || '',
                category: change.data.category || 'standard',
                x: Math.random() * 400 + 100,
                y: Math.random() * 300 + 100,
                width: DEFAULT_ENTITY_WIDTH,
                height: calculateEntityHeight((change.data.attributes || []).length),
                attributes: (change.data.attributes || []).map((a: any) => ({
                  id: a.id || generateId(),
                  name: a.name,
                  type: a.type || 'VARCHAR(255)',
                  isPrimaryKey: a.isPrimaryKey || false,
                  isForeignKey: a.isForeignKey || false,
                  isRequired: a.isRequired ?? true,
                  isUnique: a.isUnique || false,
                  isIndexed: a.isIndexed || false,
                })),
              };
              addEntity(newEntity);
              appliedChanges.push({ type: 'add_entity', entityId: newEntity.id });
            }
            break;

          case 'modify_entity':
            if (change.entityId && change.data) {
              updateEntity(change.entityId, change.data);
              appliedChanges.push({ type: 'modify_entity', entityId: change.entityId });
            }
            break;

          case 'delete_entity':
            if (change.entityId) {
              deleteEntity(change.entityId);
              appliedChanges.push({ type: 'delete_entity', entityId: change.entityId });
            }
            break;

          case 'add_attribute':
            if (change.entityId && change.data) {
              const entity = model?.entities.find(e => e.id === change.entityId);
              if (entity) {
                const newAttr: Attribute = {
                  id: change.data.id || generateId(),
                  name: change.data.name,
                  type: change.data.type || 'VARCHAR(255)',
                  isPrimaryKey: change.data.isPrimaryKey || false,
                  isForeignKey: change.data.isForeignKey || false,
                  isRequired: change.data.isRequired ?? true,
                  isUnique: change.data.isUnique || false,
                  isIndexed: change.data.isIndexed || false,
                };
                updateEntity(change.entityId, {
                  attributes: [...entity.attributes, newAttr],
                  height: calculateEntityHeight(entity.attributes.length + 1),
                });
                appliedChanges.push({ type: 'add_attribute', entityId: change.entityId, attributeId: newAttr.id });
              }
            }
            break;

          case 'modify_attribute':
            if (change.entityId && change.attributeId && change.data) {
              const entity = model?.entities.find(e => e.id === change.entityId);
              if (entity) {
                updateEntity(change.entityId, {
                  attributes: entity.attributes.map(a =>
                    a.id === change.attributeId ? { ...a, ...change.data } : a
                  ),
                });
                appliedChanges.push({ type: 'modify_attribute', entityId: change.entityId, attributeId: change.attributeId });
              }
            }
            break;

          case 'delete_attribute':
            if (change.entityId && change.attributeId) {
              const entity = model?.entities.find(e => e.id === change.entityId);
              if (entity) {
                const newAttrs = entity.attributes.filter(a => a.id !== change.attributeId);
                updateEntity(change.entityId, {
                  attributes: newAttrs,
                  height: calculateEntityHeight(newAttrs.length),
                });
                appliedChanges.push({ type: 'delete_attribute', entityId: change.entityId, attributeId: change.attributeId });
              }
            }
            break;

          case 'add_relationship':
            if (change.data) {
              const newRel: Relationship = {
                id: change.data.id || generateId(),
                name: change.data.name || '',
                type: change.data.type || 'non-identifying',
                sourceEntityId: change.data.sourceEntityId,
                targetEntityId: change.data.targetEntityId,
                sourceCardinality: change.data.sourceCardinality || '1',
                targetCardinality: change.data.targetCardinality || 'M',
              };
              addRelationship(newRel);
              appliedChanges.push({ type: 'add_relationship', relationshipId: newRel.id });
            }
            break;

          case 'modify_relationship':
            if (change.relationshipId && change.data) {
              updateRelationship(change.relationshipId, change.data);
              appliedChanges.push({ type: 'modify_relationship', relationshipId: change.relationshipId });
            }
            break;

          case 'delete_relationship':
            if (change.relationshipId) {
              deleteRelationship(change.relationshipId);
              appliedChanges.push({ type: 'delete_relationship', relationshipId: change.relationshipId });
            }
            break;
        }
      } catch (error) {
        console.error('Failed to apply change:', change, error);
      }
    });

    return appliedChanges;
  }, [model, addEntity, updateEntity, deleteEntity, addRelationship, updateRelationship, deleteRelationship]);

  const handleSend = useCallback(async (content: string) => {
    if (!model) return;

    // Add user message
    const userMessage: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Create assistant message placeholder
    const assistantMessageId = generateId();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, currentModel: model }),
      });

      if (!response.ok) {
        throw new Error('Failed to process message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setMessages(prev => prev.map(m =>
                  m.id === assistantMessageId
                    ? { ...m, content: fullContent }
                    : m
                ));
              }
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Ignore parse errors for incomplete JSON
            }
          }
        }
      }

      // Parse the response and apply changes
      const parsed = parseModifyResponse(fullContent);
      let appliedChanges: ModelChange[] = [];

      if (parsed && parsed.changes && parsed.changes.length > 0) {
        appliedChanges = applyChanges(parsed.changes);
      }

      // Update the message with final content and changes
      setMessages(prev => prev.map(m =>
        m.id === assistantMessageId
          ? {
              ...m,
              content: parsed?.explanation || fullContent,
              isStreaming: false,
              modelChanges: appliedChanges.length > 0 ? appliedChanges : undefined,
            }
          : m
      ));

    } catch (error: any) {
      setMessages(prev => prev.map(m =>
        m.id === assistantMessageId
          ? {
              ...m,
              content: 'Sorry, I encountered an error processing your request.',
              isStreaming: false,
              error: error.message,
            }
          : m
      ));
    } finally {
      setIsProcessing(false);
    }
  }, [model, applyChanges]);

  const handleClearChat = () => {
    setMessages([]);
  };

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-accent-primary hover:bg-accent-primary/90 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
      >
        <MessageSquare className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="w-80 bg-dark-bg border-l border-dark-border flex flex-col h-full">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-accent-primary" />
          <span className="font-medium">AI Chat</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="p-1.5 hover:bg-dark-hover rounded transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 hover:bg-dark-hover rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Ask me to modify your data model.</p>
            <p className="text-xs mt-2">
              Try: "Add a status field to users"
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      <div className="px-4 py-2 border-t border-dark-border">
        <SuggestionChips onSelect={handleSend} disabled={isProcessing} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dark-border">
        <ChatInput
          onSend={handleSend}
          disabled={isProcessing || !model}
          placeholder={model ? "Describe changes..." : "Generate a model first"}
        />
      </div>
    </div>
  );
}
