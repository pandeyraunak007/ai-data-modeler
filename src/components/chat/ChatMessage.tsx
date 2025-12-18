'use client';

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { User, Bot, AlertCircle } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isError = !!message.error;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
          isUser
            ? 'bg-accent-primary'
            : isError
            ? 'bg-accent-danger'
            : 'bg-dark-card border border-dark-border'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-accent-primary" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`chat-message ${isUser ? 'user' : 'assistant'} ${
          isError ? 'border-accent-danger/50 bg-accent-danger/10' : ''
        }`}
      >
        {message.isStreaming ? (
          <span className="streaming-cursor">{message.content}</span>
        ) : (
          <div className="whitespace-pre-wrap">{message.content}</div>
        )}

        {/* Show model changes if any */}
        {message.modelChanges && message.modelChanges.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dark-border">
            <p className="text-xs text-gray-500 mb-1">Changes applied:</p>
            <ul className="text-xs space-y-0.5">
              {message.modelChanges.map((change, i) => (
                <li key={i} className="text-accent-success">
                  • {change.type.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-1 text-xs text-gray-500">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
