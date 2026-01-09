'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useModel } from '@/context/ModelContext';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { parseModifyResponse } from '@/lib/prompts/modifyModel';
import { generateId, Entity, Attribute, Relationship, calculateEntityHeight, DEFAULT_ENTITY_WIDTH, ModelChange } from '@/types/model';
import { ModificationProposal, createModificationProposal } from '@/types/proposal';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import SuggestionChips from './SuggestionChips';
import { ActionPreviewCard, ConfirmationModal, ImpactDetailsModal } from '@/components/proposal';
import { MessageSquare, X, Trash2, ChevronDown } from 'lucide-react';

interface ChatPanelProps {
  onCollapse?: () => void;
}

export default function ChatPanel({ onCollapse }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll tracking state
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessageCount, setNewMessageCount] = useState(0);

  // Proposal state - NO auto-apply, user must confirm
  const [pendingProposal, setPendingProposal] = useState<ModificationProposal | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showImpactDetails, setShowImpactDetails] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const { model, updateEntity, addEntity, deleteEntity, addRelationship, deleteRelationship, updateRelationship } = useModel();

  // Check if user is at bottom of scroll
  const checkIfAtBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const threshold = 100; // pixels from bottom to consider "at bottom"
    const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    return isBottom;
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    const atBottom = checkIfAtBottom();
    setIsAtBottom(atBottom);

    // Clear new message count when user scrolls to bottom
    if (atBottom) {
      setNewMessageCount(0);
    }
  }, [checkIfAtBottom]);

  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef(messages.length);

  // Smart scroll to bottom - only if user is already at bottom
  useEffect(() => {
    const hasNewMessages = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (hasNewMessages) {
      // User is scrolled up and there are new messages
      setNewMessageCount(prev => prev + 1);
    }
  }, [messages.length, isAtBottom]);

  // Also scroll when proposal changes and user is at bottom
  useEffect(() => {
    if (isAtBottom && pendingProposal) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [pendingProposal, isAtBottom]);

  // Scroll to bottom handler
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setNewMessageCount(0);
    setIsAtBottom(true);
  }, []);

  // Apply model changes from AI response - ONLY called after user confirmation
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

      // Parse the response
      const parsed = parseModifyResponse(fullContent);

      if (parsed && parsed.rawChanges && parsed.rawChanges.length > 0) {
        // Create a proposal instead of auto-applying changes
        const proposal = createModificationProposal(content, {
          type: 'modification',
          explanation: parsed.explanation,
          changes: parsed.changes,
          impactSummary: parsed.impactSummary,
          warnings: parsed.warnings,
          suggestions: parsed.suggestions,
          rawChanges: parsed.rawChanges,
        });

        setPendingProposal(proposal);

        // Update the message to show that a proposal is pending
        setMessages(prev => prev.map(m =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: 'I have prepared changes for your review. Please confirm to apply them.',
                isStreaming: false,
              }
            : m
        ));
      } else if (parsed && parsed.explanation) {
        // No changes needed, just show the explanation
        setMessages(prev => prev.map(m =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: parsed.explanation,
                isStreaming: false,
              }
            : m
        ));
      } else {
        // Fallback - show the raw content
        setMessages(prev => prev.map(m =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: fullContent,
                isStreaming: false,
              }
            : m
        ));
      }

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
  }, [model]);

  // Handle user clicking "Proceed" on the proposal
  const handleProceed = () => {
    setShowConfirmation(true);
  };

  // Handle user confirming the changes
  const handleConfirm = () => {
    if (!pendingProposal) return;

    setIsApplying(true);

    try {
      // Apply the changes
      const appliedChanges = applyChanges(pendingProposal.rawChanges);

      // Add a success message
      const successMessage: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        content: `Changes applied successfully! ${appliedChanges.length} ${appliedChanges.length === 1 ? 'change' : 'changes'} made to your model.`,
        timestamp: new Date().toISOString(),
        modelChanges: appliedChanges,
      };
      setMessages(prev => [...prev, successMessage]);

      // Clear the proposal
      setPendingProposal(null);
      setShowConfirmation(false);
    } catch (error: any) {
      // Show error message
      const errorMessage: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        content: `Failed to apply changes: ${error.message}`,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsApplying(false);
    }
  };

  // Handle user cancelling the proposal
  const handleCancel = () => {
    if (pendingProposal) {
      // Add a cancellation message
      const cancelMessage: ChatMessageType = {
        id: generateId(),
        role: 'assistant',
        content: 'Changes cancelled. No modifications were made to your model.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, cancelMessage]);
    }

    setPendingProposal(null);
    setShowConfirmation(false);
    setShowImpactDetails(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    setPendingProposal(null);
    setNewMessageCount(0);
    setIsAtBottom(true);
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-dark-bg flex flex-col h-full relative">
        {/* Header */}
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-accent-primary" />
            <span className="font-medium">AI Chat</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClearChat}
              className="p-1.5 hover:bg-light-hover dark:hover:bg-dark-hover rounded transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
            {onCollapse && (
              <button
                onClick={onCollapse}
                className="p-1.5 hover:bg-light-hover dark:hover:bg-dark-hover rounded transition-colors"
                title="Hide Chat"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 relative"
        >
          {messages.length === 0 && !pendingProposal ? (
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

          {/* Pending Proposal Card */}
          {pendingProposal && (
            <ActionPreviewCard
              proposal={pendingProposal}
              onProceed={handleProceed}
              onCancel={handleCancel}
              onShowImpact={() => setShowImpactDetails(true)}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Button */}
        {!isAtBottom && messages.length > 0 && (
          <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={scrollToBottom}
              className="flex items-center gap-2 px-3 py-2 bg-accent-primary text-white rounded-full shadow-lg hover:bg-accent-primary-dark transition-all hover:scale-105"
            >
              <ChevronDown className="w-4 h-4" />
              {newMessageCount > 0 && (
                <span className="text-xs font-medium">
                  {newMessageCount} new
                </span>
              )}
            </button>
          </div>
        )}

        {/* Suggestions */}
        <div className="px-4 py-2 border-t border-light-border dark:border-dark-border">
          <SuggestionChips onSelect={handleSend} disabled={isProcessing || !!pendingProposal} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-light-border dark:border-dark-border">
          <ChatInput
            onSend={handleSend}
            disabled={isProcessing || !model || !!pendingProposal}
            placeholder={
              pendingProposal
                ? "Confirm or cancel pending changes first"
                : model
                ? "Describe changes..."
                : "Generate a model first"
            }
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmation(false)}
        title="Confirm Model Changes"
        description="Apply the following changes to your data model?"
        changes={pendingProposal?.changes}
        entityCount={pendingProposal?.impactSummary.entitiesAffected}
        attributeCount={pendingProposal?.impactSummary.attributesAffected}
        relationshipCount={pendingProposal?.impactSummary.relationshipsAffected}
        warnings={pendingProposal?.impactSummary.breakingChanges}
        isLoading={isApplying}
      />

      {/* Impact Details Modal */}
      {pendingProposal && (
        <ImpactDetailsModal
          isOpen={showImpactDetails}
          onClose={() => setShowImpactDetails(false)}
          proposal={pendingProposal}
        />
      )}
    </>
  );
}
